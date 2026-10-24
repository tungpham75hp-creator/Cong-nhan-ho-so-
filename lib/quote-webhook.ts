import "server-only";
import { parseWebhookUrl } from "@/lib/webhook";

const WEBHOOK_TIMEOUT_MS = 8_000;

export interface QuoteWebhookPayload {
  customerName: string;
  email: string;
  /** Mã gói dịch vụ: co_ban hoặc toan_dien. */
  servicePackage: string;
  /** Tên gói để hiển thị, ví dụ "Cơ bản". */
  servicePackageName: string;
  priceVnd: number;
}

/**
 * Gửi thông tin yêu cầu báo giá mới tới webhook (Make.com). Địa chỉ nằm trong biến QUOTE_WEBHOOK_URL.
 * Không bao giờ ném lỗi: yêu cầu của khách đã được lưu vào database, lỗi webhook chỉ được ghi log
 * (không ghi địa chỉ webhook hay thông tin khách vào log).
 */
export async function notifyQuoteWebhook(payload: QuoteWebhookPayload): Promise<void> {
  const raw = process.env.QUOTE_WEBHOOK_URL;
  if (!raw) return; // chưa cấu hình thì bỏ qua

  const url = parseWebhookUrl(raw);
  if (!url) {
    console.error("QUOTE_WEBHOOK_URL không hợp lệ (cần địa chỉ https), bỏ qua việc gửi webhook.");
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "quote_request.created", ...payload }),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    if (res.ok) {
      console.log(`Quote webhook delivered (HTTP ${res.status}).`);
    } else {
      console.error(`Quote webhook failed (HTTP ${res.status}).`);
    }
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`Quote webhook error (${reason}).`);
  }
}
