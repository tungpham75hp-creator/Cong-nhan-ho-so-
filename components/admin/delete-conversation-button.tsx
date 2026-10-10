"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteConversationAction } from "@/app/admin/conversations/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      disabled={pending}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 />
      {pending ? "Đang xoá..." : label}
    </Button>
  );
}

export function DeleteConversationButton({
  id,
  label = "Xoá",
}: {
  id: string;
  label?: string;
}) {
  return (
    <form
      action={deleteConversationAction}
      onSubmit={(e) => {
        if (!window.confirm("Xoá cuộc trò chuyện này cùng toàn bộ tin nhắn? Không thể khôi phục.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton label={label} />
    </form>
  );
}
