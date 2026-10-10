import { cookies } from "next/headers";
import { CHAT_MODEL, SYSTEM_INSTRUCTION } from "@/lib/chat";
import { createGemini, generateWithRetry } from "@/lib/gemini";
import {
  addMessage,
  conversationExists,
  createConversation,
  getRecentMessages,
  isUuid,
} from "@/lib/chat-store";

const MAX_CONTEXT_MESSAGES = 12; // số tin gần nhất gửi cho Gemini làm ngữ cảnh
const MAX_HISTORY_MESSAGES = 200; // số tin tối đa trả về khi khách mở lại khung chat
const MAX_CHARS = 1000;

// Cookie chỉ chứa mã cuộc trò chuyện (UUID ngẫu nhiên), httpOnly nên JS trên trình duyệt không đọc được.
// Toàn bộ nội dung nằm trong Supabase và chỉ server này đọc/ghi được.
const COOKIE_NAME = "chat_cid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

async function currentConversationId(): Promise<string | null> {
  const id = (await cookies()).get(COOKIE_NAME)?.value;
  if (!isUuid(id)) return null;
  return (await conversationExists(id)) ? id : null;
}

export async function GET() {
  try {
    const id = await currentConversationId();
    if (!id) return Response.json({ messages: [] });

    const messages = await getRecentMessages(id, MAX_HISTORY_MESSAGES);
    return Response.json({ messages });
  } catch (err) {
    console.error("Load chat history error:", err);
    return Response.json({ error: "Không tải được lịch sử trò chuyện." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text || text.length > MAX_CHARS) {
    return Response.json(
      { error: `Tin nhắn cần có từ 1 đến ${MAX_CHARS} ký tự.` },
      { status: 400 },
    );
  }

  try {
    let conversationId = await currentConversationId();
    if (!conversationId) {
      conversationId = await createConversation();
      (await cookies()).set(COOKIE_NAME, conversationId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }

    // Lưu câu hỏi của khách trước, rồi đọc ngữ cảnh từ chính database.
    await addMessage(conversationId, "user", text);
    const context = await getRecentMessages(conversationId, MAX_CONTEXT_MESSAGES);
    while (context.length && context[0].role !== "user") context.shift();

    const response = await generateWithRetry(createGemini(), {
      model: CHAT_MODEL,
      contents: context.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.2 },
    });

    const reply = response.text?.trim();
    if (!reply) {
      return Response.json({ error: "Không nhận được phản hồi." }, { status: 502 });
    }

    await addMessage(conversationId, "model", reply);
    return Response.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return Response.json({ error: "Có lỗi khi gọi trợ lý." }, { status: 502 });
  }
}
