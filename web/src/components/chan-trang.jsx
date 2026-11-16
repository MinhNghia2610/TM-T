import { Link } from "react-router-dom";
import { useCategories } from "../danh-muc.js";

// Chân trang dùng chung: tóm tắt cửa hàng, danh mục (lấy từ API) và lối tắt
// tới giỏ hàng / đơn hàng. Giúp các trang rời rạc có cùng một điểm kết thúc.
export default function Footer() {
  const categories = useCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">Tech Zone</div>
          <p>
            Cửa hàng thiết bị công nghệ và đồ dùng thiết yếu: chính hãng, bảo hành
            minh bạch, giao nhanh toàn quốc.
          </p>
          <p className="footer-note">Hệ thống bán hàng đa kênh web + mobile.</p>
        </div>

        <div className="footer-col">
          <h4>Danh mục</h4>
          <ul>
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link to={`/?category=${c.slug}`}>{c.label}</Link>
              </li>
            ))}
            {categories.length > 6 && (
              <li>
                <Link to="/">Xem tất cả →</Link>
              </li>
            )}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Mua sắm</h4>
          <ul>
            <li>
              <Link to="/cart">Giỏ hàng</Link>
            </li>
            <li>
              <Link to="/orders">Đơn hàng của tôi</Link>
            </li>
            <li>
              <Link to="/login">Đăng nhập</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <ul>
            <li>Hotline: 1900 0000</li>
            <li>Email: hotro@techzone.vn</li>
            <li>8:00 – 21:00, Thứ 2 – Chủ nhật</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} Tech Zone. Bảo lưu mọi quyền.</span>
        <span>Thanh toán COD · Chuyển khoản · Thẻ</span>
      </div>
    </footer>
  );
}
