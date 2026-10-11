import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatVND } from "../api.js";
import { useCart } from "../cart.jsx";
import { useAuth } from "../auth.jsx";

export default function Cart() {
  const { items, updateQty, remove, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  async function placeOrder(goToPayment) {
    setError("");
    setPlacing(true);
    try {
      const data = await api("/orders", {
        method: "POST",
        body: {
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        },
      });

      clear();

      // Đưa người dùng tới trang thanh toán chuyên biệt (chọn COD/CASH/CHUYỂN KHOẢN/THẺ...)
      if (goToPayment) {
        navigate(`/payment/${data.order._id}`);
      } else {
        navigate("/orders");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <p>
        Giỏ hàng trống. <Link to="/">Xem sản phẩm</Link>
      </p>
    );
  }

  return (
    <div>
      <h1>Giỏ hàng</h1>

      {items.map((i) => (
        <div key={i.productId} className="cart-row">
          <img src={i.image} alt={i.name} />
          <div className="grow">
            <h3>{i.name}</h3>
            <p>
              {formatVND(i.price)} × {i.qty}
            </p>
          </div>
          <div className="qty">
            <button onClick={() => updateQty(i.productId, i.qty - 1)}>−</button>
            <span>{i.qty}</span>
            <button onClick={() => updateQty(i.productId, i.qty + 1)}>+</button>
            <button className="danger" onClick={() => remove(i.productId)}>
              Xoá
            </button>
          </div>
        </div>
      ))}

      <div className="cart-total">
        <h2>Tổng cộng: {formatVND(total)}</h2>
        {user ? (
          <>
            <button className="primary" disabled={placing} onClick={() => placeOrder(false)}>
              {placing ? "Đang xử lý..." : "Đặt hàng (làm sau)"}
            </button>
            <button className="primary" disabled={placing} onClick={() => placeOrder(true)}>
              {placing ? "Đang xử lý..." : "Đặt hàng & chọn thanh toán"}
            </button>
          </>
        ) : (
          <button className="primary" onClick={() => navigate("/login")}>
            Đăng nhập để đặt hàng
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
