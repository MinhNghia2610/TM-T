// Địa chỉ server Node.
//  - Máy ảo Android:            http://10.0.2.2:3000/api  (10.0.2.2 = localhost của máy tính)
//  - Máy ảo iOS / web trong Expo: http://localhost:3000/api
//  - Điện thoại thật (Expo Go):  http://<IP-máy-tính-cùng-WiFi>:3000/api
// Có thể ghi đè bằng biến môi trường EXPO_PUBLIC_API_URL khi chạy `npx expo start`
// (ví dụ EXPO_PUBLIC_API_URL=http://192.168.1.10:3000/api), không cần sửa mã nguồn.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000/api";

// Token lưu ở biến module, được luu-tru.js cập nhật sau khi đăng nhập
let authToken = "";

export function setToken(token) {
  authToken = token || "";
}

// Store (luu-tru.js) đăng ký handler ở đây để nhận biết "phiên đã hết hạn"
// ngay bên trong api(), không phải mỗi màn hình tự bắt riêng.
let unauthorizedHandler = null;

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn || null;
}

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // Phải đọc body trước khi dựng lỗi: trước đây `data` chưa tồn tại nên mọi
  // phản hồi lỗi đều ném ReferenceError và che mất thông báo thật từ server.
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 401 = token hết hạn/không hợp lệ -> báo cho store xoá phiên và hiện màn đăng nhập
    if (res.status === 401 && unauthorizedHandler) unauthorizedHandler();
    const err = new Error(data.message || "Có lỗi xảy ra");
    err.status = res.status; // để từng màn hình phân biệt 401 / 404 / 500
    throw err;
  }
  return data;
}

export function formatVND(n) {
  return Number(n || 0).toLocaleString("vi-VN") + " ₫";
}
