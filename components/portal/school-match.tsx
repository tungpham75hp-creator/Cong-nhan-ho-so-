import { Check, HelpCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VERDICT_LABELS, type SchoolResult, type Verdict } from "@/lib/school-matching";
import { cn } from "@/lib/utils";

const ICON_STYLES: Record<Verdict, string> = {
  pass: "bg-green-500 text-white",
  fail: "bg-gray-200 text-gray-500",
  unknown: "bg-yellow-100 text-yellow-700",
};

const CARD_STYLES: Record<Verdict, string> = {
  pass: "border-green-200 bg-green-50",
  fail: "border-border bg-muted/30",
  unknown: "border-yellow-200 bg-yellow-50/60",
};

const DETAIL_STYLES: Record<Verdict, string> = {
  pass: "text-green-700",
  fail: "text-muted-foreground",
  unknown: "text-yellow-700",
};

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  const Icon = verdict === "pass" ? Check : verdict === "fail" ? X : HelpCircle;
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        ICON_STYLES[verdict],
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}

export function SchoolMatch({
  results,
  issues,
}: {
  /** null khi hồ sơ chưa đầy đủ và hợp lệ, lúc đó hiện danh sách việc cần làm (issues). */
  results: SchoolResult[] | null;
  issues: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đối chiếu điểm chuẩn</CardTitle>
        <p className="text-sm text-muted-foreground">
          So sánh điểm học tập và IELTS của bạn với điểm chuẩn từng trường. Kết quả được tính bằng
          phép so sánh số, không do AI quyết định.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {results === null && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50/60 p-4">
            <p className="font-medium">Hoàn tất hồ sơ để xem kết quả đối chiếu</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-yellow-800">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
        {results?.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có trường nào để đối chiếu.</p>
        )}
        {results?.map(({ school, verdict, gpa, ielts }) => (
          <div
            key={school.id}
            className={cn(
              "flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4",
              CARD_STYLES[verdict],
            )}
          >
            <div className="flex items-center gap-3">
              <VerdictIcon verdict={verdict} />
              <div>
                <p className="font-medium">
                  {school.name}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    · {VERDICT_LABELS[verdict]}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{school.country}</p>
              </div>
            </div>
            <div className="space-y-0.5 text-sm sm:text-right">
              <p className={DETAIL_STYLES[gpa.verdict]}>{gpa.detail}</p>
              <p className={DETAIL_STYLES[ielts.verdict]}>{ielts.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
