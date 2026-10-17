"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Advice {
  suggestion: string;
  lookedUp: string[];
}

export function ScholarshipSuggestions({ passedCount }: { passedCount: number }) {
  const [loading, setLoading] = React.useState(false);
  const [advice, setAdvice] = React.useState<Advice | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function suggest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/scholarships", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || typeof data?.suggestion !== "string") {
        setError(data?.error ?? "Không tạo được gợi ý, vui lòng thử lại.");
        return;
      }
      setAdvice({ suggestion: data.suggestion, lookedUp: data.lookedUp ?? [] });
    } catch {
      setError("Không kết nối được, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gợi ý học bổng</CardTitle>
        <p className="text-sm text-muted-foreground">
          {passedCount > 0
            ? "AI tra cứu học bổng của các trường bạn đạt yêu cầu và gợi ý học bổng phù hợp với điểm của bạn."
            : "Bạn chưa đạt yêu cầu của trường nào nên chưa có gợi ý học bổng."}
        </p>
      </CardHeader>
      {passedCount > 0 && (
        <CardContent className="space-y-4">
          <Button type="button" onClick={suggest} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {loading ? "AI đang tra cứu..." : advice ? "Gợi ý lại" : "Gợi ý học bổng cho tôi"}
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {advice && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{advice.suggestion}</p>
              {advice.lookedUp.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  AI đã tra cứu học bổng của: {advice.lookedUp.join(", ")}.
                </p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
