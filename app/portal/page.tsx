import { cookies } from "next/headers";
import { LogOut } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { DocumentFeatures } from "@/components/portal/document-features";
import { ExtractedInfo } from "@/components/portal/extracted-info";
import { isUuid } from "@/lib/chat-store";
import { PROFILE_COOKIE_NAME, getDocuments, type StudentDocuments } from "@/lib/student-store";

export default async function PortalPage() {
  const profileId = (await cookies()).get(PROFILE_COOKIE_NAME)?.value;
  const documents: StudentDocuments = isUuid(profileId) ? await getDocuments(profileId) : {};
  const { transcript, ielts, identity } = documents;

  const studentName = identity?.data.fullName ?? transcript?.data.fullName ?? ielts?.data.fullName;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-sm text-muted-foreground">Xin chào,</p>
            <h1 className="text-2xl font-medium tracking-tight">{studentName ?? "Học viên"}</h1>
          </div>
          <Button variant="outline">
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Giấy tờ cần nộp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nộp đủ 3 loại giấy tờ dưới đây, hệ thống sẽ tự đọc và trích xuất thông tin giúp bạn.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Giấy tờ được gửi tới dịch vụ Google Gemini để đọc. Hệ thống chỉ lưu thông tin trích xuất,
            không lưu lại tệp gốc.
          </p>

          <div className="mt-6">
            <DocumentFeatures
              items={[
                {
                  type: "transcript",
                  title: "Bảng điểm (PDF)",
                  accept: "Chấp nhận PDF",
                  acceptAttr: "application/pdf",
                  fileName: transcript?.fileName ?? null,
                },
                {
                  type: "ielts",
                  title: "Ảnh chứng chỉ IELTS",
                  accept: "Chấp nhận JPG, PNG",
                  acceptAttr: "image/jpeg,image/png",
                  fileName: ielts?.fileName ?? null,
                },
                {
                  type: "identity",
                  title: "Ảnh CMND/CCCD hoặc hộ chiếu",
                  accept: "Chấp nhận JPG, PNG",
                  acceptAttr: "image/jpeg,image/png",
                  fileName: identity?.fileName ?? null,
                },
              ]}
            />
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <ExtractedInfo
            transcript={transcript?.data ?? null}
            ielts={ielts?.data ?? null}
            identity={identity?.data ?? null}
          />
        </section>
      </main>
    </>
  );
}
