const BASE_URL = "/api"; // Vite tự chuyển tiếp sang http://localhost:3000 (xem vite.config.js)

export function getToken() {
  return localStorage.getItem("token") || "";
}

// Hàm gọi API chung: tự gắn token, trả về data hoặc ném Error kèm message từ server
export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
}

export function formatVND(n) {
  return Number(n || 0).toLocaleString("vi-VN") + " ₫";
}
