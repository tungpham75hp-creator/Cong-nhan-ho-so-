import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  VERDICT_LABELS,
  checkProfile,
  compareWithSchools,
  studentScores,
  type Verdict,
} from "@/lib/school-matching";
import { listSchools } from "@/lib/school-store";
import { getCurrentStudentDocuments } from "@/lib/student-store";

export const metadata: Metadata = {
  title: "Điểm chuẩn trường — DuHoc24",
  description: "Điểm học tập và IELTS tối thiểu của các trường tham chiếu.",
};

const TONES: Record<Verdict, "green" | "gray" | "yellow"> = {
  pass: "green",
  fail: "gray",
  unknown: "yellow",
};

export default async function SchoolsPage() {
  await connection(); // luôn đọc dữ liệu mới từ database, không prerender lúc build
  const [schools, documents] = await Promise.all([listSchools(), getCurrentStudentDocuments()]);

  // Chỉ đối chiếu khi hồ sơ đầy đủ và hợp lệ; so sánh bằng phép tính số, không dùng AI.
  const docs = {
    transcript: documents.transcript?.data ?? null,
    ielts: documents.ielts?.data ?? null,
    identity: documents.identity?.data ?? null,
  };
  const check = checkProfile(docs);
  const results = check.ready ? compareWithSchools(schools, studentScores(docs)) : null;
  const resultOf = new Map(results?.map((r) => [r.school.id, r]));
  const startedProfile = !!(docs.transcript || docs.ielts || docs.identity);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <h1 className="text-3xl font-medium tracking-tight">Điểm chuẩn trường</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Điểm học tập và IELTS tối thiểu của từng trường, dùng để đối chiếu với hồ sơ của bạn.
        </p>
        {!results && (
          <div className="mt-2 max-w-2xl text-sm text-muted-foreground">
            <p>
              Muốn biết bạn có đạt hay không?{" "}
              <Link href="/portal" className="font-medium text-primary hover:underline">
                {startedProfile ? "Hoàn tất hồ sơ ở Cổng hồ sơ" : "Nộp giấy tờ ở Cổng hồ sơ"}
              </Link>{" "}
              để hệ thống đối chiếu giúp bạn.
            </p>
            {startedProfile && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {check.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {results && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Cột &quot;Kết quả của bạn&quot; được tính bằng phép so sánh số giữa điểm trong hồ sơ của
            bạn và điểm chuẩn của trường, không do AI quyết định.
          </p>
        )}

        <Card className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên trường</TableHead>
                <TableHead>Quốc gia</TableHead>
                <TableHead>Điểm học tập tối thiểu</TableHead>
                <TableHead>Điểm IELTS tối thiểu</TableHead>
                {results && <TableHead>Kết quả của bạn</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={results ? 5 : 4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Chưa có trường nào.
                  </TableCell>
                </TableRow>
              )}
              {schools.map((school) => {
                const r = resultOf.get(school.id);
                return (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.country}</TableCell>
                    <TableCell>{school.minGpa.toFixed(1)}</TableCell>
                    <TableCell>{school.minIelts.toFixed(1)}</TableCell>
                    {results && (
                      <TableCell>
                        {r && (
                          <div className="space-y-1">
                            <StatusBadge tone={TONES[r.verdict]} label={VERDICT_LABELS[r.verdict]} />
                            <p className="text-xs text-muted-foreground">{r.gpa.detail}</p>
                            <p className="text-xs text-muted-foreground">{r.ielts.detail}</p>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
