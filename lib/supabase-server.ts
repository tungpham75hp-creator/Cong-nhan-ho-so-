import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client dùng khoá secret (bỏ qua RLS) — chỉ được import ở code chạy trên server.
// Dữ liệu hội thoại là riêng tư: bảng bật RLS và không có policy, trình duyệt không truy cập được.
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env");
  }

  client = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
