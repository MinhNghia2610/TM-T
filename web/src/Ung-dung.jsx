import { Routes, Route } from "react-router-dom";
import Navbar from "./components/thanh-dieu-huong.jsx";
import Products from "./pages/trang-san-pham.jsx";
import ProductDetail from "./pages/trang-chi-tiet-san-pham.jsx";
import Cart from "./pages/trang-gio-hang.jsx";
import Orders from "./pages/trang-don-hang.jsx";
import Payment from "./pages/trang-thanh-toan.jsx";
import Login from "./pages/trang-dang-nhap.jsx";
import AdminLayout from "./admin/khung-quan-tri.jsx";
import AdminDashboard from "./admin/trang-tong-quan.jsx";
import AdminProducts from "./admin/quan-ly-san-pham.jsx";
import AdminOrders from "./admin/quan-ly-don-hang.jsx";
import AdminUsers from "./admin/quan-ly-nguoi-dung.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          {/* Giao diện khách hàng */}
          <Route path="/" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          {/* Module quản trị riêng: layout + các trang con, chỉ admin vào được */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}
