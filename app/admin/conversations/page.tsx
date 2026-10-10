import Link from "next/link";
import { connection } from "next/server";
import { LeadQualityBadge } from "@/components/admin/lead-quality-badge";
import { DeleteConversationButton } from "@/components/admin/delete-conversation-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listConversations } from "@/lib/chat-store";
import { formatDateTime } from "@/lib/format";
import { getLeadQualities } from "@/lib/lead-store";

export default async function AdminConversationsPage() {
  await connection(); // luôn đọc dữ liệu mới từ database, không prerender lúc build
  const conversations = await listConversations();
  const qualities = await getLeadQualities(conversations.map((c) => c.id));

  return (
    <>
      <AdminPageHeader
        title="Hội thoại"
        description="Lịch sử hội thoại thật của khách với chatbot trên trang chủ. Bấm vào một dòng để xem từng tin nhắn."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Câu hỏi đầu tiên</TableHead>
              <TableHead>Số tin nhắn</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Bắt đầu</TableHead>
              <TableHead>Tin mới nhất</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Chưa có cuộc trò chuyện nào.
                </TableCell>
              </TableRow>
            )}
            {conversations.map((conv) => (
              <TableRow key={conv.id}>
                <TableCell className="font-mono text-xs">
                  <Link
                    href={`/admin/conversations/${conv.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {conv.id.slice(0, 8)}
                  </Link>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {conv.preview ?? <span className="text-muted-foreground">(chưa có)</span>}
                </TableCell>
                <TableCell>{conv.messageCount} tin nhắn</TableCell>
                <TableCell>
                  {qualities.has(conv.id) ? (
                    <LeadQualityBadge quality={qualities.get(conv.id)!} />
                  ) : (
                    <span className="text-xs text-muted-foreground">Chưa trích xuất</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(conv.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(conv.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <DeleteConversationButton id={conv.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
