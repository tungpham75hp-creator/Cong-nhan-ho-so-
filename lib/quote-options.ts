// Tuỳ chọn của biểu mẫu báo giá, dùng chung cho cả trình duyệt (biểu mẫu) và server (kiểm tra dữ liệu).

export const degreeLevels = [
  { value: "thpt", label: "THPT" },
  { value: "dai_hoc", label: "Đại học" },
  { value: "thac_si", label: "Thạc sĩ" },
] as const;

export type DegreeLevel = (typeof degreeLevels)[number]["value"];

export function degreeLevelLabel(value: string): string {
  return degreeLevels.find((l) => l.value === value)?.label ?? value;
}
