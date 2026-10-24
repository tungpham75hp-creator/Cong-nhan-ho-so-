"use client";

import React from "react";
import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveQuoteAction, type ApproveState } from "@/app/admin/requests/actions";
import { cn } from "@/lib/utils";

const initialState: ApproveState = { status: "idle", message: null };

export function ApproveQuoteButton({
  id,
  customerName,
  pending,
  children,
}: {
  id: string;
  customerName: string;
  /** true khi yêu cầu đang chờ duyệt; chỉ lúc đó mới hiện nút Duyệt. */
  pending: boolean;
  /** Các nút khác đặt cạnh nút Duyệt (ví dụ Từ chối). */
  children?: React.ReactNode;
}) {
  const [state, formAction, submitting] = useActionState(approveQuoteAction, initialState);

  return (
    <div className="flex max-w-[16rem] flex-col items-end gap-1">
      {pending && (
        <div className="flex gap-2">
          <form
            action={formAction}
            onSubmit={(e) => {
              const ok = window.confirm(
                `Duyệt yêu cầu của ${customerName}?\nHệ thống sẽ gửi tên, email và link đăng nhập của khách tới Make.com để gửi email cho khách.`,
              );
              if (!ok) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={id} />
            <Button type="submit" size="icon-sm" variant="outline" aria-label="Duyệt" disabled={submitting}>
              {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            </Button>
          </form>
          {children}
        </div>
      )}
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={cn("text-right text-xs", state.status === "error" ? "text-red-600" : "text-green-700")}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
