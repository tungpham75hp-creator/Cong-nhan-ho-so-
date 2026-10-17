import { cookies } from "next/headers";
import {
  DOC_MODEL,
  DOC_TYPES,
  DocumentRejectedError,
  extractDocument,
  type DocType,
} from "@/lib/document-extraction";
import { isUuid } from "@/lib/chat-store";
import {
  PROFILE_COOKIE_MAX_AGE,
  PROFILE_COOKIE_NAME,
  createProfile,
  profileExists,
  saveDocument,
} from "@/lib/student-store";

const MAX_BYTES = 8 * 1024 * 1024;

type Mime = "application/pdf" | "image/jpeg" | "image/png";

// Bảng điểm chỉ nhận PDF; chứng chỉ IELTS và CMND/hộ chiếu chỉ nhận ảnh JPG/PNG.
const ALLOWED_MIME: Record<DocType, Mime[]> = {
  transcript: ["application/pdf"],
  ielts: ["image/jpeg", "image/png"],
  identity: ["image/jpeg", "image/png"],
};

const ACCEPT_HINT: Record<DocType, string> = {
  transcript: "Bảng điểm chỉ nhận tệp PDF.",
  ielts: "Chứng chỉ IELTS chỉ nhận ảnh JPG hoặc PNG.",
  identity: "CMND/hộ chiếu chỉ nhận ảnh JPG hoặc PNG.",
};

/** Nhận diện loại tệp qua nội dung thật, không tin tên tệp hay loại do trình duyệt khai. */
function detectMime(buf: Buffer): Mime | null {
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  return null;
}

function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const cleaned = base.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 255);
  return cleaned || "tai-lieu";
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const type = form?.get("type");
  const file = form?.get("file");

  if (typeof type !== "string" || !(DOC_TYPES as readonly string[]).includes(type)) {
    return error("Loại giấy tờ không hợp lệ.", 400);
  }
  const docType = type as DocType;

  if (!(file instanceof File) || file.size === 0) return error("Vui lòng chọn một tệp.", 400);
  if (file.size > MAX_BYTES) return error("Tệp quá lớn, tối đa 8 MB.", 413);

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectMime(buffer);
  if (!mime || !ALLOWED_MIME[docType].includes(mime)) {
    return error(ACCEPT_HINT[docType], 415);
  }

  try {
    const data = await extractDocument(docType, buffer, mime);

    // Chỉ tạo hồ sơ sau khi đọc thành công, để lần tải lỗi không để lại hồ sơ rỗng.
    const cookieStore = await cookies();
    let profileId = cookieStore.get(PROFILE_COOKIE_NAME)?.value;
    if (!isUuid(profileId) || !(await profileExists(profileId))) {
      profileId = await createProfile();
      cookieStore.set(PROFILE_COOKIE_NAME, profileId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: PROFILE_COOKIE_MAX_AGE,
      });
    }

    await saveDocument(profileId, docType, safeFileName(file.name), data, DOC_MODEL);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof DocumentRejectedError) return error(err.message, 422);
    console.error("Document extraction error:", err);
    return error("Không xử lý được giấy tờ, vui lòng thử lại sau ít phút.", 502);
  }
}
