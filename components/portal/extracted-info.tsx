import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

interface TranscriptInfo {
  fullName: string | null;
  dateOfBirth: string | null;
  overallGpa: number | null;
  gpaScale: number | null;
}

interface IeltsInfo {
  fullName: string | null;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  overall: number | null;
  testDate: string | null;
}

interface IdentityInfo {
  fullName: string | null;
  dateOfBirth: string | null;
  documentNumber: string | null;
}

interface Field {
  label: string;
  value: string | null;
}

const band = (v: number | null) => (v === null ? null : v.toFixed(1));
const date = (v: string | null) => (v === null ? null : formatDate(v));

function FieldGrid({ fields }: { fields: Field[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="rounded-lg bg-muted/40 p-3">
          <dt className="text-xs text-muted-foreground">{field.label}</dt>
          <dd className="mt-1 text-base font-medium">
            {field.value ?? <span className="font-normal text-muted-foreground">Không đọc được</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, fields }: { title: string; fields: Field[] | null }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {fields ? (
        <FieldGrid fields={fields} />
      ) : (
        <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">Chưa nộp giấy tờ này.</p>
      )}
    </div>
  );
}

export function ExtractedInfo({
  transcript,
  ielts,
  identity,
}: {
  transcript: TranscriptInfo | null;
  ielts: IeltsInfo | null;
  identity: IdentityInfo | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đã trích xuất</CardTitle>
        <p className="text-sm text-muted-foreground">
          Đây là thông tin hệ thống đọc được từ giấy tờ bạn đã nộp, kiểm tra lại xem có đúng không nhé.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <Section
          title="Bảng điểm"
          fields={
            transcript && [
              { label: "Họ tên", value: transcript.fullName },
              { label: "Ngày sinh", value: date(transcript.dateOfBirth) },
              {
                label: "Điểm học tập tổng kết",
                value:
                  transcript.overallGpa === null
                    ? null
                    : transcript.gpaScale === null
                      ? String(transcript.overallGpa)
                      : `${transcript.overallGpa} / ${transcript.gpaScale}`,
              },
            ]
          }
        />
        <Section
          title="Chứng chỉ IELTS"
          fields={
            ielts && [
              { label: "Họ tên trên chứng chỉ", value: ielts.fullName },
              { label: "Ngày thi", value: date(ielts.testDate) },
              { label: "Nghe (Listening)", value: band(ielts.listening) },
              { label: "Đọc (Reading)", value: band(ielts.reading) },
              { label: "Viết (Writing)", value: band(ielts.writing) },
              { label: "Nói (Speaking)", value: band(ielts.speaking) },
              { label: "Điểm tổng (Overall)", value: band(ielts.overall) },
            ]
          }
        />
        <Section
          title="CMND/CCCD hoặc hộ chiếu"
          fields={
            identity && [
              { label: "Họ tên", value: identity.fullName },
              { label: "Ngày sinh", value: date(identity.dateOfBirth) },
              { label: "Số giấy tờ", value: identity.documentNumber },
            ]
          }
        />
      </CardContent>
    </Card>
  );
}
