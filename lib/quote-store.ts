import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { DegreeLevel } from "@/lib/quote-options";
import type { RequestStatus, ServicePackage } from "@/lib/mock-data";

export interface NewQuoteRequest {
  customerName: string;
  email: string;
  phone: string;
  country: string;
  degreeLevel: DegreeLevel;
  servicePackage: ServicePackage;
  priceVnd: number;
}

export interface QuoteRequest extends NewQuoteRequest {
  id: string;
  status: RequestStatus;
  createdAt: string;
}

interface QuoteRow {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  country: string;
  degree_level: DegreeLevel;
  service_package: ServicePackage;
  price_vnd: number;
  status: RequestStatus;
  created_at: string;
}

/** Lưu yêu cầu báo giá mới; trạng thái luôn bắt đầu là "chờ duyệt". */
export async function createQuoteRequest(input: NewQuoteRequest): Promise<void> {
  const { error } = await getSupabaseAdmin().from("quote_requests").insert({
    customer_name: input.customerName,
    email: input.email,
    phone: input.phone,
    country: input.country,
    degree_level: input.degreeLevel,
    service_package: input.servicePackage,
    price_vnd: input.priceVnd,
    status: "cho_duyet",
  });
  if (error) throw error;
}

/** Các yêu cầu mới nhất, dùng cho trang quản trị. */
export async function listQuoteRequests(limit = 200): Promise<QuoteRequest[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("quote_requests")
    .select(
      "id, customer_name, email, phone, country, degree_level, service_package, price_vnd, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data as QuoteRow[]).map((r) => ({
    id: r.id,
    customerName: r.customer_name,
    email: r.email,
    phone: r.phone,
    country: r.country,
    degreeLevel: r.degree_level,
    servicePackage: r.service_package,
    priceVnd: Number(r.price_vnd),
    status: r.status,
    createdAt: r.created_at,
  }));
}

/**
 * "Nhận" việc duyệt một yêu cầu: chỉ đổi chờ duyệt → đã duyệt khi yêu cầu còn đang chờ duyệt, trong một câu lệnh
 * duy nhất (nên hai lần bấm cùng lúc chỉ một lần thành công). Trả về thông tin khách, hoặc null nếu yêu cầu
 * không tồn tại hoặc không còn ở trạng thái chờ duyệt.
 */
export async function claimQuoteForApproval(
  id: string,
): Promise<{ customerName: string; email: string } | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("quote_requests")
    .update({ status: "da_duyet" })
    .eq("id", id)
    .eq("status", "cho_duyet")
    .select("customer_name, email");
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return { customerName: data[0].customer_name as string, email: data[0].email as string };
}

/** Hoàn tác việc duyệt (đã duyệt → chờ duyệt) khi chưa gửi được thông tin cho Make.com, để admin thử lại. */
export async function revertQuoteApproval(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("quote_requests")
    .update({ status: "cho_duyet" })
    .eq("id", id)
    .eq("status", "da_duyet");
  if (error) throw error;
}
