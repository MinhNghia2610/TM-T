import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useCart } from "../cart.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        Tech Zone
      </Link>
      <nav>
        <Link to="/">Sản phẩm</Link>
        <Link to="/cart">Giỏ hàng ({items.length})</Link>
        <Link to="/orders">Đơn của tôi</Link>
        {user ? (
          <>
            <span className="user-name">Xin chào, {user.name}</span>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login">Đăng nhập</Link>
        )}
      </nav>
    </header>
  );
}
