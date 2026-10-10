import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { LEAD_MODEL, type LeadData, type LeadQuality } from "@/lib/lead-extraction";

export interface StoredLead extends LeadData {
  conversationId: string;
  model: string;
  /** Số tin nhắn của cuộc trò chuyện tại thời điểm trích xuất. */
  messageCount: number;
  extractedAt: string;
}

interface LeadRow {
  conversation_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  study_country: string | null;
  education_level: string | null;
  major: string | null;
  availability: string | null;
  wants_consultation: boolean | null;
  note: string | null;
  quality: LeadQuality;
  model: string;
  message_count: number;
  extracted_at: string;
}

function fromRow(r: LeadRow): StoredLead {
  return {
    conversationId: r.conversation_id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    studyCountry: r.study_country,
    educationLevel: r.education_level,
    major: r.major,
    availability: r.availability,
    wantsConsultation: r.wants_consultation,
    note: r.note,
    quality: r.quality,
    model: r.model,
    messageCount: r.message_count,
    extractedAt: r.extracted_at,
  };
}

export async function getLead(conversationId: string): Promise<StoredLead | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .select("*")
    .eq("conversation_id", conversationId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as LeadRow) : null;
}

/** Mỗi cuộc trò chuyện có đúng một lead; trích xuất lại sẽ ghi đè bản cũ. */
export async function saveLead(conversationId: string, lead: LeadData, messageCount: number) {
  const { error } = await getSupabaseAdmin()
    .from("leads")
    .upsert({
      conversation_id: conversationId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      study_country: lead.studyCountry,
      education_level: lead.educationLevel,
      major: lead.major,
      availability: lead.availability,
      wants_consultation: lead.wantsConsultation,
      note: lead.note,
      quality: lead.quality,
      model: LEAD_MODEL,
      message_count: messageCount,
      extracted_at: new Date().toISOString(),
    });
  if (error) throw error;
}

/** Chất lượng lead của nhiều cuộc trò chuyện cùng lúc, dùng cho cột trong danh sách admin. */
export async function getLeadQualities(
  conversationIds: string[],
): Promise<Map<string, LeadQuality>> {
  const result = new Map<string, LeadQuality>();
  if (!conversationIds.length) return result;

  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .select("conversation_id, quality")
    .in("conversation_id", conversationIds);
  if (error) throw error;
  for (const row of data) result.set(row.conversation_id, row.quality as LeadQuality);
  return result;
}
