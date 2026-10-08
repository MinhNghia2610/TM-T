// Địa chỉ server Node.
//  - Máy ảo Android:            http://10.0.2.2:3000/api  (10.0.2.2 = localhost của máy tính)
//  - Máy ảo iOS / web trong Expo: http://localhost:3000/api
//  - Điện thoại thật (Expo Go):  http://<IP-máy-tính-cùng-WiFi>:3000/api, ví dụ http://192.168.1.10:3000/api
const BASE_URL = "http://10.0.2.2:3000/api";

// Token lưu ở biến module, được store.js cập nhật sau khi đăng nhập
let authToken = "";

export function setToken(token) {
  authToken = token || "";
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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
}

export function formatVND(n) {
  return Number(n || 0).toLocaleString("vi-VN") + " ₫";
}
