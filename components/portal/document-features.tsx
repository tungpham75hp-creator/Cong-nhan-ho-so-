"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileText, IdCard, Medal, Upload, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DocStatusBadge } from "@/components/status-badge";
import type { DocStatus } from "@/lib/mock-data";

type DocType = "transcript" | "ielts" | "identity";

const MAX_BYTES = 8 * 1024 * 1024;

const ICONS: Record<DocType, LucideIcon> = {
  transcript: FileText,
  ielts: Medal,
  identity: IdCard,
};

interface DocumentItem {
  type: DocType;
  title: string;
  accept: string; // dòng mô tả hiển thị cho học viên
  acceptAttr: string; // thuộc tính accept của ô chọn tệp
  fileName: string | null; // tên tệp đã nộp, null nếu chưa nộp
}

function DocumentCard({ item }: { item: DocumentItem }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const Icon = ICONS[item.type];
  const status: DocStatus = uploading
    ? "dang_xu_ly"
    : error
      ? "can_nop_lai"
      : item.fileName
        ? "hop_le"
        : "chua_nop";

  async function upload(file: File) {
    if (file.size > MAX_BYTES) {
      setError("Tệp quá lớn, tối đa 8 MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("type", item.type);
      body.set("file", file);
      const res = await fetch("/api/portal/documents", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Không tải lên được, vui lòng thử lại.");
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được, vui lòng thử lại.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <Card className="flex aspect-video flex-col items-center justify-center gap-2 border-none bg-foreground/5 p-6 shadow-none ring-0">
        <Icon className="size-7 text-muted-foreground" />
        <span className="max-w-full truncate px-4 text-xs text-muted-foreground">
          {item.fileName ?? "Chưa có tệp"}
        </span>
      </Card>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
          <DocStatusBadge status={status} />
        </div>
        <p className="mt-3 text-balance text-muted-foreground">
          {status === "can_nop_lai" && error ? (
            <>
              Cần nộp lại: <span className="text-red-600">{error}</span>
            </>
          ) : (
            item.accept
          )}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={item.acceptAttr}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload />
          {uploading ? "Đang đọc giấy tờ..." : item.fileName ? "Nộp lại" : "Chọn tệp"}
        </Button>
      </div>
    </div>
  );
}

export function DocumentFeatures({ items }: { items: DocumentItem[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {items.map((item) => (
        <DocumentCard key={item.type} item={item} />
      ))}
    </div>
  );
}
