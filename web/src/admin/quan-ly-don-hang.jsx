import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

// Mã đơn hiển thị cho dễ đọc: 6 ký tự cuối của ObjectId
function orderCode(id) {
  return String(id).slice(-6).toUpperCase();
}

// Trang quản trị đơn hàng: xem tất cả đơn (mọi người dùng), lọc/tìm kiếm
// và cập nhật trạng thái.
export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  // Bộ lọc nằm trên URL: link từ dashboard (?status=..., ?q=<mã đơn>) mở đúng
  // danh sách đã lọc, và nút Back của trình duyệt vẫn hoạt động.
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState(
    STATUSES.includes(statusParam) ? statusParam : "ALL"
  );

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

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
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: order.status } : o))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  if (error && !orders) return <p className="error">{error}</p>;
  if (!orders) return <p>Đang tải...</p>;
  if (orders.length === 0) return <p>Chưa có đơn hàng nào.</p>;

  const counts = { ALL: orders.length };
  for (const s of STATUSES) counts[s] = 0;
  for (const o of orders) {
    counts[o.status] = (counts[o.status] || 0) + 1;
  }

  const needle = search.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (!needle) return true;
    const haystack = [
      orderCode(o._id),
      o.user?.name,
      o.user?.email,
      ...o.items.map((i) => i.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
  const filteredTotal = filtered.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div>
      <h1>Đơn hàng</h1>
      <p className="admin-sub">
        Tất cả đơn của mọi người dùng. Trạng thái do quản trị viên quản lý.
      </p>
      {error && <p className="error">{error}</p>}

      <div className="filter-bar">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateParam("q", e.target.value.trim());
          }}
          placeholder="Tìm theo mã đơn, người mua hoặc sản phẩm..."
          aria-label="Tìm đơn hàng"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            updateParam("status", e.target.value === "ALL" ? "" : e.target.value);
          }}
          aria-label="Lọc theo trạng thái"
        >
          <option value="ALL">Tất cả trạng thái ({counts.ALL})</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s} ({counts[s]})
            </option>
          ))}
        </select>
      </div>

      <p className="filter-summary">
        Hiển thị <strong>{filtered.length}</strong>/{orders.length} đơn • Tổng giá trị{" "}
        <strong>{formatVND(filteredTotal)}</strong>
      </p>

      {filtered.length === 0 ? (
        <p className="admin-empty">Không có đơn nào khớp bộ lọc.</p>
      ) : (
        filtered.map((o) => (
          <div key={o._id} className="order-card">
            <div className="order-head">
              <span>#{orderCode(o._id)}</span>
              <span className="status">{o.status}</span>
              <span className={o.paid ? "pay-badge paid" : "pay-badge unpaid"}>
                {o.paid ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
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
        ))
      )}
    </div>
  );
}
