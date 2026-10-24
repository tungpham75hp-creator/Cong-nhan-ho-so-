import "server-only";

/** Chỉ cho phép https (trừ localhost khi chạy thử) để không gửi thông tin khách qua kết nối không mã hoá. */
export function parseWebhookUrl(raw: string | undefined): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return url.protocol === "https:" || (local && url.protocol === "http:") ? url : null;
  } catch {
    return null;
  }
}
