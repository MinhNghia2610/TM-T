import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useCart } from "../cart.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Tìm kiếm từ mọi trang: chuyển tới trang sản phẩm kèm query ?q=...
  function submitSearch(e) {
    e.preventDefault();
    navigate(search.trim() ? `/?q=${encodeURIComponent(search.trim())}` : "/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        Tech Zone
      </Link>

      <form className="navbar-search" onSubmit={submitSearch}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
          aria-label="Tìm sản phẩm"
        />
        <button type="submit">🔍</button>
      </form>

      <nav>
        <Link to="/">Sản phẩm</Link>
        <Link to="/cart">Giỏ hàng ({items.length})</Link>
        <Link to="/orders">Đơn của tôi</Link>
        {user?.role === "admin" && <Link to="/admin">Quản trị</Link>}
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
