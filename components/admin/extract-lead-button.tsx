"use client";

import { useActionState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractLeadAction, type ExtractLeadState } from "@/app/admin/conversations/actions";

const initialState: ExtractLeadState = { error: null };

export function ExtractLeadButton({ id, hasLead }: { id: string; hasLead: boolean }) {
  const [state, formAction, pending] = useActionState(extractLeadAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {pending ? "Đang trích xuất..." : hasLead ? "Trích xuất lại" : "Trích xuất lead"}
      </Button>
      {state.error && <p className="max-w-xs text-right text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
