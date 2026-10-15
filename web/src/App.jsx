import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Orders from "./pages/Orders.jsx";
import Payment from "./pages/Payment.jsx";
import Login from "./pages/Login.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./admin/Dashboard.jsx";
import AdminProducts from "./admin/Products.jsx";
import AdminOrders from "./admin/Orders.jsx";
import AdminUsers from "./admin/Users.jsx";

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
