import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatVND } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);

  const loadOrders = () => {
    api("/orders")
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  function payOrder(id) {
    // Mở trang thanh toán chuyên biệt để chọn phương thức (COD/CASH/CHUYỂN KHOẢN/THẺ...)
    navigate(`/payment/${id}`);
  }

  if (!user) {
    return (
      <p>
        Bạn cần <Link to="/login">đăng nhập</Link> để xem đơn hàng.
      </p>
    );
  }

  if (!orders) return <p>Đang tải...</p>;
  if (orders.length === 0) return <p>Chưa có đơn hàng nào.</p>;

  return (
    <div>
      <h1>Đơn hàng của tôi</h1>

      {orders.map((o) => (
        <div key={o._id} className="order-card">
          <div className="order-head">
            <span>#{String(o._id).slice(-6).toUpperCase()}</span>
            <span className="status">{o.status}</span>
            <span>{new Date(o.createdAt).toLocaleString("vi-VN")}</span>
          </div>
          <ul>
            {o.items.map((i) => (
              <li key={i.productId}>
                {i.name} × {i.qty} — {formatVND(i.price * i.qty)}
              </li>
            ))}
          </ul>
          <p className="total">Tổng: {formatVND(o.total)}</p>
          {o.paymentMethod && (
            <p className="pm-method">Phương thức: {o.paymentMethod}</p>
          )}
          {!o.paid && (
            <button className="primary" onClick={() => payOrder(o._id)}>
              Thanh toán
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
