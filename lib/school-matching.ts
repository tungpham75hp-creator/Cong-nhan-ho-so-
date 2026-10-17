import type { School } from "@/lib/mock-data";

// Hàm thuần (không đụng database) để đối chiếu điểm học viên với điểm chuẩn từng trường.
// Điểm chuẩn trong bảng schools tính theo thang 10.

export type Verdict = "pass" | "fail" | "unknown";

export interface Criterion {
  verdict: Verdict;
  detail: string;
}

export interface StudentScores {
  /** Điểm học tập đã quy về thang 10; null nếu chưa có hoặc chưa quy đổi được. */
  gpa10: number | null;
  /** Lý do chưa có gpa10, để hiển thị cho học viên. */
  gpaIssue: string | null;
  /** Điểm IELTS tổng (Overall); null nếu chưa có. */
  ielts: number | null;
}

export interface SchoolResult {
  school: School;
  verdict: Verdict;
  gpa: Criterion;
  ielts: Criterion;
}

const round2 = (n: number) => Number(n.toFixed(2));

export function studentScores(docs: {
  transcript: { overallGpa: number | null; gpaScale: number | null } | null;
  ielts: { overall: number | null } | null;
}): StudentScores {
  let gpa10: number | null = null;
  let gpaIssue: string | null = null;

  const t = docs.transcript;
  if (!t) {
    gpaIssue = "Chưa nộp bảng điểm.";
  } else if (t.overallGpa === null) {
    gpaIssue = "Không đọc được điểm học tập tổng kết từ bảng điểm.";
  } else if (t.gpaScale === null) {
    gpaIssue = "Không xác định được thang điểm của bảng điểm.";
  } else if (t.gpaScale === 10) {
    gpa10 = t.overallGpa;
  } else if (t.gpaScale === 100) {
    gpa10 = t.overallGpa / 10;
  } else {
    // Không quy đổi tuyến tính từ thang khác (ví dụ 4.0): dễ cho kết quả đạt/trượt sai.
    gpaIssue = `Bảng điểm theo thang ${t.gpaScale}, chưa quy đổi được sang thang 10.`;
  }

  return { gpa10: gpa10 === null ? null : round2(gpa10), gpaIssue, ielts: docs.ielts?.overall ?? null };
}

export function compareWithSchool(school: School, scores: StudentScores): SchoolResult {
  const gpa: Criterion =
    scores.gpa10 === null
      ? { verdict: "unknown", detail: scores.gpaIssue ?? "Chưa có điểm học tập." }
      : scores.gpa10 >= school.minGpa
        ? { verdict: "pass", detail: `Điểm học tập ${scores.gpa10} ≥ ${school.minGpa.toFixed(1)}` }
        : { verdict: "fail", detail: `Điểm học tập ${scores.gpa10} < ${school.minGpa.toFixed(1)}` };

  const ielts: Criterion =
    scores.ielts === null
      ? { verdict: "unknown", detail: "Chưa có điểm IELTS." }
      : scores.ielts >= school.minIelts
        ? { verdict: "pass", detail: `IELTS ${scores.ielts.toFixed(1)} ≥ ${school.minIelts.toFixed(1)}` }
        : { verdict: "fail", detail: `IELTS ${scores.ielts.toFixed(1)} < ${school.minIelts.toFixed(1)}` };

  // Trượt một tiêu chí là chắc chắn chưa đạt, dù tiêu chí kia còn thiếu thông tin.
  const verdict: Verdict =
    gpa.verdict === "fail" || ielts.verdict === "fail"
      ? "fail"
      : gpa.verdict === "unknown" || ielts.verdict === "unknown"
        ? "unknown"
        : "pass";

  return { school, verdict, gpa, ielts };
}

export function compareWithSchools(schools: School[], scores: StudentScores): SchoolResult[] {
  return schools.map((s) => compareWithSchool(s, scores));
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  pass: "Đạt",
  fail: "Chưa đạt",
  unknown: "Chưa đủ thông tin",
};

// ---- Kiểm tra hồ sơ đầy đủ và hợp lệ trước khi đối chiếu ----

interface TranscriptLike {
  fullName: string | null;
  dateOfBirth: string | null;
  overallGpa: number | null;
  gpaScale: number | null;
}

interface IeltsLike {
  fullName: string | null;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  overall: number | null;
  testDate: string | null;
}

interface IdentityLike {
  fullName: string | null;
  dateOfBirth: string | null;
  documentNumber: string | null;
}

export interface ProfileDocs {
  transcript: TranscriptLike | null;
  ielts: IeltsLike | null;
  identity: IdentityLike | null;
}

export interface ProfileCheck {
  /** true khi đủ cả 3 giấy tờ, đọc được mọi trường và có thể so sánh được với điểm chuẩn. */
  ready: boolean;
  /** Những việc học viên còn phải làm; rỗng khi ready. */
  issues: string[];
}

const TRANSCRIPT_FIELDS: [keyof TranscriptLike, string][] = [
  ["fullName", "họ tên"],
  ["dateOfBirth", "ngày sinh"],
  ["overallGpa", "điểm tổng kết"],
  ["gpaScale", "thang điểm"],
];

const IELTS_FIELDS: [keyof IeltsLike, string][] = [
  ["fullName", "họ tên"],
  ["listening", "điểm Nghe"],
  ["reading", "điểm Đọc"],
  ["writing", "điểm Viết"],
  ["speaking", "điểm Nói"],
  ["overall", "điểm tổng"],
  ["testDate", "ngày thi"],
];

const IDENTITY_FIELDS: [keyof IdentityLike, string][] = [
  ["fullName", "họ tên"],
  ["dateOfBirth", "ngày sinh"],
  ["documentNumber", "số giấy tờ"],
];

function missingFields<T extends object>(doc: T, fields: [keyof T, string][]): string[] {
  return fields.filter(([key]) => doc[key] === null).map(([, label]) => label);
}

/**
 * Hồ sơ "đầy đủ và hợp lệ" khi: nộp đủ 3 giấy tờ, mọi trường cần trích xuất đều đọc được,
 * và điểm học tập quy đổi được sang thang 10. Chỉ khi đó mới đối chiếu điểm chuẩn.
 */
export function checkProfile(docs: ProfileDocs): ProfileCheck {
  const issues: string[] = [];

  const sections: [string, object | null, [string, string][]][] = [
    ["bảng điểm", docs.transcript, TRANSCRIPT_FIELDS as [string, string][]],
    ["chứng chỉ IELTS", docs.ielts, IELTS_FIELDS as [string, string][]],
    ["CMND/CCCD hoặc hộ chiếu", docs.identity, IDENTITY_FIELDS as [string, string][]],
  ];
  for (const [name, doc, fields] of sections) {
    if (!doc) {
      issues.push(`Chưa nộp ${name}.`);
      continue;
    }
    const missing = fields
      .filter(([key]) => (doc as Record<string, unknown>)[key] === null)
      .map(([, label]) => label);
    if (missing.length > 0) {
      issues.push(`Không đọc được ${missing.join(", ")} từ ${name}. Hãy nộp lại bản rõ nét hơn.`);
    }
  }

  // Đủ trường nhưng thang điểm lạ (ví dụ 4.0) thì vẫn chưa so sánh được.
  const t = docs.transcript;
  if (t && missingFields(t, TRANSCRIPT_FIELDS).length === 0) {
    const scores = studentScores({ transcript: t, ielts: null });
    if (scores.gpa10 === null && scores.gpaIssue) issues.push(scores.gpaIssue);
  }

  return { ready: issues.length === 0, issues };
}
