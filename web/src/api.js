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
  if (!res.ok) {
    // 401 = token hết hạn hoặc phiên không còn hợp lệ: xoá thông tin đã lưu
    // và đưa khách về trang đăng nhập thay vì để trang hiện "không có gì".
    // (Trang /login tự mở 401 khi sai mật khẩu -> không chuyển hướng nữa.)
    if (res.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login");
    }
    const err = new Error(data.message || "Có lỗi xảy ra");
    err.status = res.status; // để từng trang phân biệt 401 / 404 / 500
    throw err;
  }
  return data;
}

export function formatVND(n) {
  return Number(n || 0).toLocaleString("vi-VN") + " ₫";
}
