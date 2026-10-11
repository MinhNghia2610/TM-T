import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatVND } from "../api.js";
import { useAuth } from "../auth.jsx";

// Trang thanh toán chuyên biệt: hiển thị đơn hàng + danh sách phương thức,
// chọn phương thức rồi xác nhận thanh toán (hoặc chọn COD).
export default function Payment() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [methods, setMethods] = useState([]);
  const [selected, setSelected] = useState(null); // code của phương thức đang chọn
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user) return;
    api(`/orders/${orderId}`)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message));
  }, [user, orderId]);

  useEffect(() => {
    fetch("/api/payment-methods")
      .then((r) => r.json())
      .then((d) => setMethods(d.methods || []))
      .catch(() => setMethods([]));
  }, []);

  async function confirmPay() {
    if (!selected) {
      setError("Vui lòng chọn một phương thức thanh toán.");
      return;
    }
    setError("");
    setPaying(true);
    try {
      await api(`/orders/${orderId}/pay`, {
        method: "POST",
        body: { method: selected },
      });
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  }

  if (!user) {
    return (
      <p>
        Bạn cần <Link to="/login">đăng nhập</Link> để thanh toán đơn hàng.
      </p>
    );
  }

  if (error && !order) {
    return (
      <p className="error">
        {error} — <Link to="/orders">Quay lại đơn hàng</Link>
      </p>
    );
  }

  if (!order) return <p>Đang tải...</p>;

  if (order.paid) {
    return (
      <p>
        Đơn hàng này đã được thanh toán.{" "}
        <Link to="/orders">Xem đơn hàng của tôi</Link>
      </p>
    );
  }

  const selectedMethod = methods.find((m) => m.code === selected);

  return (
    <div className="payment-page">
      <h1>Thanh toán đơn hàng</h1>

      <div className="order-card">
        <div className="order-head">
          <span>#{String(order._id).slice(-6).toUpperCase()}</span>
          <span className="status">{order.status}</span>
          <span>{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
        </div>
        <ul>
          {order.items.map((i) => (
            <li key={i.productId}>
              {i.name} × {i.qty} — {formatVND(i.price * i.qty)}
            </li>
          ))}
        </ul>
        <p className="total">Tổng cần thanh toán: {formatVND(order.total)}</p>
      </div>

      <h2>Chọn phương thức thanh toán</h2>

      <div className="payment-methods">
        {methods.map((m) => (
          <label
            key={m.code}
            className={`payment-option ${selected === m.code ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="payment-method"
              value={m.code}
              checked={selected === m.code}
              onChange={() => setSelected(m.code)}
            />
            <div className="grow">
              <strong>{m.label}</strong>
              <p>{m.description}</p>
              {m.bank && (
                <p className="bank-info">
                  Ngân hàng: {m.bank.bankLabel} — STK: {m.bank.accountNumber} — {m.bank.accountName}
                  <br />
                  Chi nhánh: {m.bank.branch}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="payment-actions">
        <button className="primary" disabled={paying} onClick={confirmPay}>
          {paying
            ? "Đang xử lý..."
            : selectedMethod && selectedMethod.code === "COD"
            ? "Đặt hàng COD (xác nhận)"
            : "Xác nhận thanh toán"}
        </button>
        <Link to="/orders">Huỷ và quay lại</Link>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
