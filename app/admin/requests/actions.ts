"use server";

import { revalidatePath } from "next/cache";
import { isUuid } from "@/lib/chat-store";
import { getApprovalConfig, sendApprovalWebhook } from "@/lib/approval-webhook";
import { claimQuoteForApproval, revertQuoteApproval } from "@/lib/quote-store";

export interface ApproveState {
  status: "idle" | "success" | "error";
  message: string | null;
}

const fail = (message: string): ApproveState => ({ status: "error", message });

const CONFIG_MESSAGES = {
  not_configured: "Chưa cấu hình APPROVAL_WEBHOOK_URL trong .env nên chưa duyệt được.",
  invalid_webhook: "APPROVAL_WEBHOOK_URL không hợp lệ (cần địa chỉ https) nên chưa duyệt được.",
  invalid_login_url: "LOGIN_URL không hợp lệ nên chưa duyệt được.",
} as const;

/**
 * Duyệt một yêu cầu báo giá: đổi trạng thái sang "đã duyệt" rồi gửi tên, email và link đăng nhập của khách
 * tới Make.com. Nếu chưa gửi được thì hoàn tác về "chờ duyệt" để admin thử lại, tránh duyệt mà khách không nhận được email.
 */
export async function approveQuoteAction(
  _prev: ApproveState,
  formData: FormData,
): Promise<ApproveState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !isUuid(id)) return fail("Mã yêu cầu không hợp lệ.");

  // Kiểm tra cấu hình trước khi đổi trạng thái, để thiếu cấu hình thì không làm thay đổi gì.
  const config = getApprovalConfig();
  if (!config.ok) return fail(CONFIG_MESSAGES[config.reason]);

  try {
    const customer = await claimQuoteForApproval(id);
    if (!customer) {
      revalidatePath("/admin/requests");
      return fail("Yêu cầu này không còn ở trạng thái chờ duyệt (có thể đã được xử lý).");
    }

    const sent = await sendApprovalWebhook(config, customer);
    if (!sent.ok) {
      try {
        await revertQuoteApproval(id);
      } catch (err) {
        console.error("Revert approval error:", err);
        revalidatePath("/admin/requests");
        return fail(
          "Đã duyệt nhưng chưa gửi được thông tin tới Make.com, và không hoàn tác được trạng thái. Hãy kiểm tra lại thủ công.",
        );
      }
      revalidatePath("/admin/requests");
      return fail("Chưa gửi được thông tin tới Make.com nên chưa duyệt, yêu cầu vẫn chờ duyệt. Hãy thử lại.");
    }

    revalidatePath("/admin/requests");
    return {
      status: "success",
      message: "Đã duyệt và gửi tên, email, link đăng nhập của khách tới Make.com.",
    };
  } catch (err) {
    console.error("Approve quote error:", err);
    return fail("Không duyệt được, vui lòng thử lại sau ít phút.");
  }
}
