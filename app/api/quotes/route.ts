import { after } from "next/server";
import { countries, servicePackages } from "@/lib/mock-data";
import { isValidEmail } from "@/lib/email";
import { degreeLevels, type DegreeLevel } from "@/lib/quote-options";
import { createQuoteRequest } from "@/lib/quote-store";
import { notifyQuoteWebhook } from "@/lib/quote-webhook";

const PHONE_RE = /^[0-9 +().-]{6,20}$/;

function error(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max + 1) : "";

// Nhận yêu cầu báo giá từ trang chủ. Giá luôn do server tính từ gói dịch vụ, không nhận giá từ trình duyệt.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return error("Dữ liệu không hợp lệ.");

  const customerName = str(body.name, 100);
  const email = str(body.email, 254).toLowerCase();
  const phone = str(body.phone, 20);
  const country = str(body.country, 100);
  const degreeLevel = str(body.degreeLevel, 20);
  const packageId = str(body.servicePackage, 20);

  if (!customerName || customerName.length > 100) return error("Vui lòng nhập họ tên (tối đa 100 ký tự).");
  if (!isValidEmail(email)) return error("Email không hợp lệ.");
  if (!PHONE_RE.test(phone) || phone.replace(/\D/g, "").length < 8) return error("Số điện thoại không hợp lệ.");
  if (!(countries as readonly string[]).includes(country)) return error("Vui lòng chọn quốc gia muốn du học.");
  if (!degreeLevels.some((l) => l.value === degreeLevel)) return error("Bậc học không hợp lệ.");

  const servicePackage = servicePackages.find((p) => p.id === packageId);
  if (!servicePackage) return error("Gói dịch vụ không hợp lệ.");

  try {
    await createQuoteRequest({
      customerName,
      email,
      phone,
      country,
      degreeLevel: degreeLevel as DegreeLevel,
      servicePackage: servicePackage.id,
      priceVnd: servicePackage.price,
    });
    // Báo cho Make.com sau khi đã phản hồi khách; lỗi webhook không ảnh hưởng yêu cầu đã lưu.
    after(() =>
      notifyQuoteWebhook({
        customerName,
        email,
        servicePackage: servicePackage.id,
        servicePackageName: servicePackage.name,
        priceVnd: servicePackage.price,
      }),
    );
    return Response.json({ ok: true, priceVnd: servicePackage.price });
  } catch (err) {
    console.error("Create quote request error:", err);
    return error("Không gửi được yêu cầu, vui lòng thử lại sau ít phút.", 502);
  }
}
