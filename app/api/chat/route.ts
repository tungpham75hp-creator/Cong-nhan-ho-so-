import { GoogleGenAI } from "@google/genai";
import { CHAT_MODEL, SYSTEM_INSTRUCTION } from "@/lib/chat";

const MAX_MESSAGES = 12;
const MAX_CHARS = 1000;
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 25_000;

interface ChatTurn {
  role: "user" | "model";
  text: string;
}

function parseHistory(body: unknown): ChatTurn[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const turns: ChatTurn[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    const role = m?.role;
    const text = typeof m?.text === "string" ? m.text.trim().slice(0, MAX_CHARS) : "";
    if ((role !== "user" && role !== "model") || !text) return null;
    turns.push({ role, text });
  }

  // Gemini yêu cầu hội thoại bắt đầu bằng lượt của user và kết thúc bằng user.
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (turns.length === 0 || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chatbot chưa được cấu hình." }, { status: 500 });
  }

  const turns = parseHistory(await request.json().catch(() => null));
  if (!turns) {
    return Response.json({ error: "Tin nhắn không hợp lệ." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: REQUEST_TIMEOUT_MS } });
    const request = {
      model: CHAT_MODEL,
      contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.2 },
    };

    // Model đôi khi trả 503/429 do quá tải tạm thời, thử lại vài lần trước khi báo lỗi.
    let response;
    for (let attempt = 1; ; attempt++) {
      try {
        response = await ai.models.generateContent(request);
        break;
      } catch (err) {
        const status = (err as { status?: number }).status;
        if (attempt >= MAX_ATTEMPTS || (status !== 503 && status !== 429)) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    const text = response.text?.trim();
    if (!text) {
      return Response.json({ error: "Không nhận được phản hồi." }, { status: 502 });
    }
    return Response.json({ reply: text });
  } catch (err) {
    console.error("Gemini error:", err);
    return Response.json({ error: "Có lỗi khi gọi trợ lý." }, { status: 502 });
  }
}
