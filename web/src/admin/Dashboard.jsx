import { useEffect, useState } from "react";
import { api, formatVND } from "../api.js";

// Trang tổng quan của module quản trị: các số liệu nhanh.
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/stats")
      .then((data) => setStats(data.stats))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Đang tải...</p>;

  const cards = [
    { label: "Sản phẩm", value: stats.totalProducts },
    { label: "Người dùng", value: stats.totalUsers },
    { label: "Đơn hàng", value: stats.totalOrders },
    { label: "Đơn đã thanh toán", value: stats.paidOrders },
    { label: "Doanh thu", value: formatVND(stats.revenue) },
  ];

  return (
    <div>
      <h1>Tổng quan</h1>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
