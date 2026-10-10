import { StatusBadge } from "@/components/status-badge";
import type { LeadQuality } from "@/lib/lead-extraction";

const meta: Record<LeadQuality, { label: string; tone: "green" | "yellow" | "red" }> = {
  good: { label: "Good", tone: "green" },
  ok: { label: "OK", tone: "yellow" },
  spam: { label: "Spam", tone: "red" },
};

export function LeadQualityBadge({ quality }: { quality: LeadQuality }) {
  return <StatusBadge tone={meta[quality].tone} label={meta[quality].label} />;
}
