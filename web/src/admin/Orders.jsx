import { useEffect, useState } from "react";
import { api, formatVND } from "../api.js";

// Danh sách trạng thái — trùng khớp với ADMIN_ORDER_STATUSES ở server
const STATUSES = [
  "MỚI",
  "CHỜ GIAO HÀNG",
  "ĐÃ THANH TOÁN",
  "ĐANG GIAO HÀNG",
  "HOÀN THÀNH",
  "ĐÃ HUỶ",
];

// Trang quản trị đơn hàng: xem tất cả đơn (mọi người dùng) và cập nhật trạng thái.
export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  function load() {
    api("/admin/orders")
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function changeStatus(id, status) {
    setSavingId(id);
    setError("");
    try {
      const { order } = await api(`/admin/orders/${id}/status`, {
        method: "PUT",
        body: { status },
      });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: order.status } : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  if (error && !orders) return <p className="error">{error}</p>;
  if (!orders) return <p>Đang tải...</p>;
  if (orders.length === 0) return <p>Chưa có đơn hàng nào.</p>;

  return (
    <div>
      <h1>Đơn hàng</h1>
      <p className="admin-sub">Tất cả đơn của mọi người dùng. Trạng thái do quản trị viên quản lý.</p>
      {error && <p className="error">{error}</p>}

      {orders.map((o) => (
        <div key={o._id} className="order-card">
          <div className="order-head">
            <span>#{String(o._id).slice(-6).toUpperCase()}</span>
            <span className="status">{o.status}</span>
            <span>{new Date(o.createdAt).toLocaleString("vi-VN")}</span>
          </div>
          <div className="order-buyer">
            Người mua: <strong>{o.user?.name || o.userId}</strong>
            {o.user?.email ? ` (${o.user.email})` : ""}
          </div>
          <ul>
            {o.items.map((i) => (
              <li key={i.productId}>
                {i.name} × {i.qty} — {formatVND(i.price * i.qty)}
              </li>
            ))}
          </ul>
          <div className="order-admin-foot">
            <p className="total">Tổng: {formatVND(o.total)}</p>
            <label className="status-picker">
              Trạng thái:{" "}
              <select
                value={o.status}
                disabled={savingId === o._id}
                onChange={(e) => changeStatus(o._id, e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
