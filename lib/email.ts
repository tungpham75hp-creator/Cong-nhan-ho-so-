// Kiểm tra định dạng email, dùng chung cho trình duyệt (biểu mẫu) và server (API) để hai bên luôn cùng quy tắc.

const EMAIL_RE =
  /^[A-Za-z0-9._%+'-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/**
 * Email hợp lệ: có đúng một dấu @, phần tên và phần tên miền không chứa khoảng trắng,
 * tên miền có dấu chấm và đuôi từ 2 chữ cái trở lên (ví dụ ban@email.com), phần tên tối đa 64 ký tự,
 * cả địa chỉ tối đa 254 ký tự. Chỉ kiểm tra định dạng, không kiểm tra hộp thư có tồn tại hay không.
 */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (email.length > 254 || !EMAIL_RE.test(email)) return false;
  const local = email.slice(0, email.lastIndexOf("@"));
  return local.length <= 64 && !local.startsWith(".") && !local.endsWith(".") && !local.includes("..");
}
