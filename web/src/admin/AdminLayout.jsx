import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth.jsx";

// Khung của module quản trị: thanh điều hướng riêng + chặn người không phải admin.
// Mọi trang con (tổng quan, sản phẩm, đơn hàng, người dùng) nằm dưới route /admin/*.
export default function AdminLayout() {
  const { user } = useAuth();

  // Không phải admin (hoặc chưa đăng nhập) -> về trang chủ; server cũng kiểm tra lại
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const links = [
    { to: "/admin", end: true, label: "Tổng quan" },
    { to: "/admin/products", label: "Sản phẩm" },
    { to: "/admin/orders", label: "Đơn hàng" },
    { to: "/admin/users", label: "Người dùng" },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-side-head">
          <div className="admin-side-title">Module quản trị</div>
          <div className="admin-side-user">{user.email}</div>
        </div>
        <nav className="admin-side-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="admin-side-link">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <NavLink to="/" className="admin-side-link">
            ← Về trang khách
          </NavLink>
        </div>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  );
}
