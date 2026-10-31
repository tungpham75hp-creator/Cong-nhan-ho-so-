import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư — DuHoc24",
  description: "DuHoc24 thu thập, sử dụng và lưu trữ thông tin của bạn như thế nào.",
};

// Email nhận yêu cầu xoá dữ liệu; đổi ở đây nếu dùng địa chỉ khác.
const CONTACT_EMAIL = "hotro@duhoc24.vn";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <h1 className="text-3xl font-medium tracking-tight">Chính sách quyền riêng tư</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cập nhật lần cuối: 31/10/2026</p>
        <p className="mt-6 text-muted-foreground">
          Trang này giải thích DuHoc24 thu thập những thông tin gì của bạn, dùng để làm gì và lưu ở đâu.
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-medium">1. Thông tin chúng tôi thu thập</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <span className="text-foreground">Từ tài khoản Google khi bạn đăng nhập:</span> địa chỉ email và tên.
            </li>
            <li>
              <span className="text-foreground">Từ các biểu mẫu bạn điền:</span> họ tên, email, số điện thoại,
              quốc gia muốn du học, bậc học và gói dịch vụ ở form báo giá; nội dung bạn trò chuyện với chatbot
              tư vấn.
            </li>
            <li>
              <span className="text-foreground">Từ giấy tờ bạn tải lên</span> (bảng điểm, chứng chỉ IELTS,
              CMND/CCCD hoặc hộ chiếu): họ tên, ngày sinh, điểm học tập, điểm IELTS và số giấy tờ. Chúng tôi chỉ
              lưu thông tin đọc được từ giấy tờ, không lưu lại tệp gốc.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-medium">2. Mục đích sử dụng</h2>
          <p className="mt-3 text-muted-foreground">
            Thông tin được dùng để xử lý hồ sơ du học của bạn: báo giá, liên hệ tư vấn, kiểm tra giấy tờ, đối
            chiếu điểm chuẩn của các trường và gợi ý học bổng phù hợp.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-medium">3. Lưu ở đâu và ai xử lý</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Dữ liệu được lưu trên <span className="text-foreground">Supabase</span>. Chỉ hệ thống máy chủ của
              DuHoc24 truy cập được dữ liệu này, trình duyệt không truy cập trực tiếp.
            </li>
            <li>
              Để xử lý hồ sơ, một số thông tin được chuyển tới{" "}
              <span className="text-foreground">Google (Gemini)</span> để đọc giấy tờ, trả lời chatbot và gợi ý
              học bổng, và tới <span className="text-foreground">Make.com</span> để gửi email thông báo cho bạn
              (họ tên, email, gói dịch vụ, giá).
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-medium">4. Xoá dữ liệu và liên hệ</h2>
          <p className="mt-3 text-muted-foreground">
            Bạn có thể yêu cầu xoá dữ liệu của mình bất kỳ lúc nào bằng cách gửi email tới{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>
            , ghi rõ email bạn đã dùng khi đăng ký. Chúng tôi sẽ xoá dữ liệu của bạn sau khi xác nhận yêu cầu là
            của chính bạn.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
