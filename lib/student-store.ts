import "server-only";
import { cookies } from "next/headers";
import { isUuid } from "@/lib/chat-store";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { DocData, DocType } from "@/lib/document-extraction";

/**
 * Cookie httpOnly chỉ chứa mã hồ sơ (UUID ngẫu nhiên). Toàn bộ thông tin học viên nằm trong
 * Supabase và chỉ server đọc/ghi được. Khi có đăng nhập (Tuần 6) thì thay bằng tài khoản thật.
 */
export const PROFILE_COOKIE_NAME = "profile_id";
export const PROFILE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export interface StoredDocument<T extends DocType = DocType> {
  type: T;
  fileName: string;
  data: DocData[T];
  extractedAt: string;
}

export type StudentDocuments = { [T in DocType]?: StoredDocument<T> };

export async function profileExists(id: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from("student_profiles")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function createProfile(): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .from("student_profiles")
    .insert({})
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

/** Mỗi loại giấy tờ chỉ có một bản trong hồ sơ; nộp lại sẽ ghi đè bản cũ. */
export async function saveDocument<T extends DocType>(
  profileId: string,
  type: T,
  fileName: string,
  data: DocData[T],
  model: string,
) {
  const db = getSupabaseAdmin();
  const { error } = await db.from("student_documents").upsert({
    profile_id: profileId,
    doc_type: type,
    file_name: fileName,
    data,
    model,
    extracted_at: new Date().toISOString(),
  });
  if (error) throw error;
  await db
    .from("student_profiles")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", profileId);
}

export async function getDocuments(profileId: string): Promise<StudentDocuments> {
  const { data, error } = await getSupabaseAdmin()
    .from("student_documents")
    .select("doc_type, file_name, data, extracted_at")
    .eq("profile_id", profileId);
  if (error) throw error;

  const result: StudentDocuments = {};
  for (const row of data) {
    (result as Record<string, unknown>)[row.doc_type as string] = {
      type: row.doc_type,
      fileName: row.file_name,
      data: row.data,
      extractedAt: row.extracted_at,
    };
  }
  return result;
}

/** Giấy tờ của học viên đang xem trang (nhận diện qua cookie hồ sơ); rỗng nếu chưa nộp gì. */
export async function getCurrentStudentDocuments(): Promise<StudentDocuments> {
  const profileId = (await cookies()).get(PROFILE_COOKIE_NAME)?.value;
  return isUuid(profileId) ? getDocuments(profileId) : {};
}
