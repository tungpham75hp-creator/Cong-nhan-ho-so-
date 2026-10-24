import "server-only";
import { parseWebhookUrl } from "@/lib/webhook";

const WEBHOOK_TIMEOUT_MS = 8_000;

// Link mẫu trong lúc chưa có trang đăng nhập thật. Khi có, chỉ cần đổi biến LOGIN_URL trong .env.
const DEFAULT_LOGIN_URL = "http://localhost:3000/login";

export type ApprovalConfig =
  | { ok: true; webhookUrl: URL; loginUrl: string }
  | { ok: false; reason: "not_configured" | "invalid_webhook" | "invalid_login_url" };

/** Đọc cấu hình từ .env: APPROVAL_WEBHOOK_URL (địa chỉ Make.com) và LOGIN_URL (link đăng nhập gửi cho khách). */
export function getApprovalConfig(): ApprovalConfig {
  const raw = process.env.APPROVAL_WEBHOOK_URL;
  if (!raw) return { ok: false, reason: "not_configured" };

  const webhookUrl = parseWebhookUrl(raw);
  if (!webhookUrl) return { ok: false, reason: "invalid_webhook" };

  const loginRaw = process.env.LOGIN_URL || DEFAULT_LOGIN_URL;
  try {
    const login = new URL(loginRaw);
    if (login.protocol !== "https:" && login.protocol !== "http:") throw new Error("protocol");
  } catch {
    return { ok: false, reason: "invalid_login_url" };
  }
  return { ok: true, webhookUrl, loginUrl: loginRaw };
}

/**
 * Gửi thông tin khách vừa được duyệt tới Make.com để gửi email mời đăng nhập.
 * Tên các trường khớp mẫu email trong Make: [ten_khach] và [link_dang_nhap].
 * Không ghi địa chỉ webhook hay thông tin khách vào nhật ký.
 */
export async function sendApprovalWebhook(
  config: Extract<ApprovalConfig, { ok: true }>,
  customer: { customerName: string; email: string },
): Promise<{ ok: true } | { ok: false; reason: "http_error" | "network" }> {
  try {
    const res = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "quote_request.approved",
        ten_khach: customer.customerName,
        email: customer.email,
        link_dang_nhap: config.loginUrl,
      }),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`Approval webhook failed (HTTP ${res.status}).`);
      return { ok: false, reason: "http_error" };
    }
    console.log(`Approval webhook delivered (HTTP ${res.status}).`);
    return { ok: true };
  } catch (err) {
    console.error(`Approval webhook error (${err instanceof Error ? err.name : "unknown"}).`);
    return { ok: false, reason: "network" };
  }
}
