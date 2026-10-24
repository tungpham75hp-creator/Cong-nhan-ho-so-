import { connection } from "next/server";
import { X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ApproveQuoteButton } from "@/components/admin/approve-quote-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { servicePackages } from "@/lib/mock-data";
import { degreeLevelLabel } from "@/lib/quote-options";
import { listQuoteRequests } from "@/lib/quote-store";

function formatVnd(value: number) {
  return value.toLocaleString("vi-VN") + "₫";
}

function packageLabel(id: string) {
  return servicePackages.find((p) => p.id === id)?.name ?? id;
}

export default async function AdminRequestsPage() {
  await connection(); // luôn đọc dữ liệu mới từ database, không prerender lúc build
  const requests = await listQuoteRequests();

  return (
    <>
      <AdminPageHeader
        title="Yêu cầu"
        description="Danh sách yêu cầu báo giá gửi từ trang chủ, chờ đội ngũ duyệt."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách</TableHead>
              <TableHead>Quốc gia, bậc học</TableHead>
              <TableHead>Gói dịch vụ</TableHead>
              <TableHead>Báo giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Chưa có yêu cầu báo giá nào.
                </TableCell>
              </TableRow>
            )}
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <p className="font-medium">{req.customerName}</p>
                  <p className="text-xs text-muted-foreground">{req.email}</p>
                  <p className="text-xs text-muted-foreground">{req.phone}</p>
                </TableCell>
                <TableCell>
                  <p>{req.country}</p>
                  <p className="text-xs text-muted-foreground">{degreeLevelLabel(req.degreeLevel)}</p>
                </TableCell>
                <TableCell>{packageLabel(req.servicePackage)}</TableCell>
                <TableCell>{formatVnd(req.priceVnd)}</TableCell>
                <TableCell>
                  <RequestStatusBadge status={req.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(req.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <ApproveQuoteButton
                      id={req.id}
                      customerName={req.customerName}
                      pending={req.status === "cho_duyet"}
                    >
                      <Button size="icon-sm" variant="outline" aria-label="Từ chối">
                        <X className="size-3.5" />
                      </Button>
                    </ApproveQuoteButton>
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
