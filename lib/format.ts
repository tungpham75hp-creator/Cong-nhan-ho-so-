const dateTime = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "07/10/2026, 21:03" theo giờ Việt Nam. */
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
