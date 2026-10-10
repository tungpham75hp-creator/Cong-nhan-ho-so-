import "server-only";
import { GoogleGenAI, type GenerateContentParameters } from "@google/genai";

const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 25_000;

export function createGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Thiếu GEMINI_API_KEY trong .env");
  return new GoogleGenAI({ apiKey, httpOptions: { timeout: REQUEST_TIMEOUT_MS } });
}

/** Model đôi khi trả 503/429 do quá tải tạm thời, thử lại vài lần trước khi báo lỗi. */
export async function generateWithRetry(ai: GoogleGenAI, request: GenerateContentParameters) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await ai.models.generateContent(request);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (attempt >= MAX_ATTEMPTS || (status !== 503 && status !== 429)) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}
