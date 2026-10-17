import { checkProfile, compareWithSchools, studentScores } from "@/lib/school-matching";
import { suggestScholarships } from "@/lib/scholarship-advisor";
import { listSchools } from "@/lib/school-store";
import { getCurrentStudentDocuments } from "@/lib/student-store";

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

// Gợi ý học bổng cho học viên đang xem trang (nhận diện qua cookie hồ sơ).
export async function POST() {
  try {
    const documents = await getCurrentStudentDocuments();
    const docs = {
      transcript: documents.transcript?.data ?? null,
      ielts: documents.ielts?.data ?? null,
      identity: documents.identity?.data ?? null,
    };

    // Chỉ gợi ý khi hồ sơ đầy đủ, hợp lệ, và đã biết trường nào đạt (so sánh bằng phép tính số, không dùng AI).
    if (!checkProfile(docs).ready) return error("Hồ sơ chưa đầy đủ và hợp lệ.", 409);
    const scores = studentScores(docs);
    const results = compareWithSchools(await listSchools(), scores);
    const passedSchools = results.filter((r) => r.verdict === "pass").map((r) => r.school.name);
    if (passedSchools.length === 0) {
      return error("Bạn chưa đạt yêu cầu của trường nào nên chưa có gợi ý học bổng.", 409);
    }

    const advice = await suggestScholarships({
      gpa10: scores.gpa10!,
      ielts: scores.ielts!,
      passedSchools,
    });
    return Response.json({ suggestion: advice.text, lookedUp: advice.lookedUp });
  } catch (err) {
    console.error("Scholarship suggestion error:", err);
    return error("Không tạo được gợi ý học bổng, vui lòng thử lại sau ít phút.", 502);
  }
}
