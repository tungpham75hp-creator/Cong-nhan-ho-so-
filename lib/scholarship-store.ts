import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export interface ScholarshipInfo {
  name: string;
  /** Điểm học tập tối thiểu (thang 10); null nếu học bổng không yêu cầu. */
  minGpa: number | null;
  /** IELTS tối thiểu; null nếu học bổng không yêu cầu. */
  minIelts: number | null;
  /** Mức hỗ trợ dạng chữ, ví dụ "25% học phí" hoặc "Toàn phần". */
  benefit: string;
}

export type SchoolScholarships =
  | { school: string; scholarships: ScholarshipInfo[] }
  | { error: string; availableSchools: string[] };

interface ScholarshipRow {
  name: string;
  min_gpa: number | null;
  min_ielts: number | null;
  benefit_type: "percent" | "full";
  benefit_percent: number | null;
}

/** Thoát ký tự đặc biệt của LIKE để so khớp đúng nguyên văn tên trường (không phân biệt hoa thường). */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Công cụ cho AI: tra cứu học bổng của MỘT trường theo tên. Chỉ đọc dữ liệu, không có quyết định
 * đạt hay không ở đây, việc đó do AI làm dựa trên điều kiện trả về.
 */
export async function lookupScholarshipsBySchool(schoolName: string): Promise<SchoolScholarships> {
  const db = getSupabaseAdmin();

  const { data: school, error } = await db
    .from("schools")
    .select("id, name")
    .ilike("name", escapeLike(schoolName.trim()))
    .maybeSingle();
  if (error) throw error;

  if (!school) {
    const { data: all, error: allError } = await db.from("schools").select("name").order("name");
    if (allError) throw allError;
    return {
      error: `Không tìm thấy trường "${schoolName}".`,
      availableSchools: (all ?? []).map((s) => s.name as string),
    };
  }

  const { data, error: scholarshipsError } = await db
    .from("scholarships")
    .select("name, min_gpa, min_ielts, benefit_type, benefit_percent")
    .eq("school_id", school.id)
    .order("name");
  if (scholarshipsError) throw scholarshipsError;

  return {
    school: school.name as string,
    scholarships: (data as ScholarshipRow[]).map((r) => ({
      name: r.name,
      minGpa: r.min_gpa === null ? null : Number(r.min_gpa),
      minIelts: r.min_ielts === null ? null : Number(r.min_ielts),
      benefit: r.benefit_type === "full" ? "Toàn phần" : `${Number(r.benefit_percent)}% học phí`,
    })),
  };
}
