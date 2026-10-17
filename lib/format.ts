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

/** "2005-05-12" -> "12/05/2005". Trả nguyên chuỗi nếu không đúng dạng YYYY-MM-DD. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}
