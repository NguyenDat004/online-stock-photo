export function formatDateVN(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
}
