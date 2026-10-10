import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { ExtractLeadButton } from "@/components/admin/extract-lead-button";
import { LeadQualityBadge } from "@/components/admin/lead-quality-badge";
import { DeleteConversationButton } from "@/components/admin/delete-conversation-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { getConversationDetail, isUuid } from "@/lib/chat-store";
import { formatDateTime } from "@/lib/format";
import { getLead } from "@/lib/lead-store";
import { cn } from "@/lib/utils";

function LeadField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap">
        {value ?? <span className="text-muted-foreground">Chưa có</span>}
      </dd>
    </div>
  );
}

export default async function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const conversation = await getConversationDetail(id);
  if (!conversation) notFound();
  const lead = await getLead(id);
  const leadOutdated = !!lead && conversation.messages.length > lead.messageCount;

  return (
    <>
      <Link
        href="/admin/conversations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Tất cả hội thoại
      </Link>

      <AdminPageHeader
        title={`Hội thoại ${conversation.id.slice(0, 8)}`}
        description={`${conversation.messages.length} tin nhắn · bắt đầu ${formatDateTime(conversation.createdAt)} · tin mới nhất ${formatDateTime(conversation.updatedAt)}`}
        action={<DeleteConversationButton id={conversation.id} label="Xoá cuộc trò chuyện" />}
      />

      <Card className="mb-6 max-w-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium">Thông tin lead</h2>
              {lead && <LeadQualityBadge quality={lead.quality} />}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {lead
                ? `Trích xuất bởi ${lead.model} lúc ${formatDateTime(lead.extractedAt)}, từ ${lead.messageCount} tin nhắn.`
                : "Chưa trích xuất. Bấm nút bên phải để model đọc cuộc trò chuyện và lưu thông tin lead."}
            </p>
            {leadOutdated && (
              <p className="mt-1 text-xs text-yellow-700">
                Cuộc trò chuyện đã có tin nhắn mới sau lần trích xuất, bấm &quot;Trích xuất lại&quot; để cập nhật.
              </p>
            )}
          </div>
          <ExtractLeadButton id={conversation.id} hasLead={!!lead} />
        </div>

        {lead && (
          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <LeadField label="Họ tên" value={lead.name} />
            <LeadField label="Email" value={lead.email} />
            <LeadField label="Số điện thoại" value={lead.phone} />
            <LeadField label="Nước du học" value={lead.studyCountry} />
            <LeadField label="Bậc học" value={lead.educationLevel} />
            <LeadField label="Ngành" value={lead.major} />
            <LeadField label="Availability" value={lead.availability} />
            <LeadField
              label="Đặt lịch tư vấn"
              value={
                lead.wantsConsultation === null
                  ? null
                  : lead.wantsConsultation
                    ? "Có"
                    : "Không"
              }
            />
            <div className="sm:col-span-2">
              <LeadField label="Ghi chú" value={lead.note} />
            </div>
          </dl>
        )}
      </Card>

      <Card className="max-w-3xl space-y-4 p-5">
        {conversation.messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Cuộc trò chuyện này chưa có tin nhắn.</p>
        )}
        {conversation.messages.map((m) => {
          const fromUser = m.role === "user";
          return (
            <div key={m.id} className={cn("flex flex-col", fromUser ? "items-end" : "items-start")}>
              <span className="mb-1 text-xs text-muted-foreground">
                {fromUser ? "Khách" : "Chatbot"} · {formatDateTime(m.createdAt)}
              </span>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                  fromUser
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground",
                )}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
