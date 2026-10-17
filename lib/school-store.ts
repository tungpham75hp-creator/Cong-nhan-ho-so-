import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { School } from "@/lib/mock-data";

interface SchoolRow {
  id: string;
  name: string;
  country: string;
  min_gpa: number;
  min_ielts: number;
}

/** Danh sách trường tham chiếu (điểm chuẩn). Dữ liệu công khai, chỉ server được ghi. */
export async function listSchools(): Promise<School[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("schools")
    .select("id, name, country, min_gpa, min_ielts")
    .order("country", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;

  return (data as SchoolRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    minGpa: Number(r.min_gpa),
    minIelts: Number(r.min_ielts),
  }));
}
