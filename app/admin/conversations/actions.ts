"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteConversation, getConversationDetail, isUuid } from "@/lib/chat-store";
import { extractLead } from "@/lib/lead-extraction";
import { saveLead } from "@/lib/lead-store";

export async function deleteConversationAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !isUuid(id)) {
    throw new Error("Mã cuộc trò chuyện không hợp lệ.");
  }

  await deleteConversation(id);
  revalidatePath("/admin/conversations");
  redirect("/admin/conversations");
}

export interface ExtractLeadState {
  error: string | null;
}

export async function extractLeadAction(
  _prev: ExtractLeadState,
  formData: FormData,
): Promise<ExtractLeadState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !isUuid(id)) return { error: "Mã cuộc trò chuyện không hợp lệ." };

  try {
    const conversation = await getConversationDetail(id);
    if (!conversation) return { error: "Không tìm thấy cuộc trò chuyện." };
    if (!conversation.messages.some((m) => m.role === "user")) {
      return { error: "Cuộc trò chuyện chưa có tin nhắn nào của khách." };
    }

    const lead = await extractLead(
      conversation.messages.map((m) => ({ role: m.role, content: m.content })),
    );
    await saveLead(id, lead, conversation.messages.length);
  } catch (err) {
    console.error("Extract lead error:", err);
    return { error: "Không trích xuất được lead, vui lòng thử lại sau ít phút." };
  }

  revalidatePath(`/admin/conversations/${id}`);
  revalidatePath("/admin/conversations");
  return { error: null };
}
