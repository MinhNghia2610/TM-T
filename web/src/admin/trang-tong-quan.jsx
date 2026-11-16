import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatVND } from "../api.js";

// Định dạng "2026-11-14" -> "14/11" cho nhãn trục ngày
function dayLabel(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// Trang tổng quan của module quản trị: số liệu nhanh, doanh thu 7 ngày,
// phân bổ trạng thái đơn và top sản phẩm bán chạy.
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
    { label: "Sản phẩm", value: stats.totalProducts, to: "/admin/products" },
    { label: "Người dùng", value: stats.totalUsers, to: "/admin/users" },
    { label: "Đơn hàng", value: stats.totalOrders, to: "/admin/orders" },
    { label: "Đơn đã thanh toán", value: stats.paidOrders, to: "/admin/orders" },
    { label: "Doanh thu", value: formatVND(stats.revenue), accent: "good" },
    {
      label: "Chưa thu tiền",
      value: formatVND(stats.unpaidValue),
      hint: `${stats.unpaidOrders} đơn`,
      accent: "warn",
      to: "/admin/orders?status=MỚI",
    },
  ];

  const days = stats.revenue7d || [];
  const maxDay = Math.max(1, ...days.map((d) => d.revenue));
  const weekRevenue = days.reduce((sum, d) => sum + d.revenue, 0);

  const statusRows = Object.entries(stats.statusCounts || {}).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(1, ...statusRows.map(([, n]) => n));

  const top = stats.topProducts || [];

  // Doanh thu theo danh mục và đơn mới nhất: hai khối giúp dashboard trả lời
  // "bán gì" và "đơn nào cần xử lý" ngay từ màn hình đầu tiên.
  const categorySales = stats.salesByCategory || [];
  const maxCategoryRevenue = Math.max(1, ...categorySales.map((c) => c.revenue));
  const recent = stats.recentOrders || [];

  const actions = [
    { to: "/admin/products", label: "Thêm sản phẩm", hint: "Tạo mới hoặc sửa sản phẩm" },
    { to: "/admin/orders", label: "Xử lý đơn hàng", hint: "Cập nhật trạng thái giao hàng" },
    { to: "/admin/users", label: "Quản lý người dùng", hint: "Cấp hoặc thu hồi quyền admin" },
  ];

  return (
    <div>
      <h1>Tổng quan</h1>
      <p className="admin-sub">Số liệu cập nhật theo thời gian thực từ cơ sở dữ liệu.</p>

      <div className="stat-grid">
        {cards.map((c) => {
          const className = c.accent ? `stat-card ${c.accent}` : "stat-card";
          const body = (
            <>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
              {c.hint && <div className="stat-hint">{c.hint}</div>}
            </>
          );
          return c.to ? (
            <Link key={c.label} to={c.to} className={`${className} stat-card-link`}>
              {body}
            </Link>
          ) : (
            <div key={c.label} className={className}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="admin-panels">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Doanh thu 7 ngày gần nhất</h2>
            <span className="admin-panel-total">{formatVND(weekRevenue)}</span>
          </div>

          {weekRevenue === 0 ? (
            <p className="admin-empty">Chưa có đơn nào được thanh toán để vẽ biểu đồ.</p>
          ) : (
            <div className="chart">
              {days.map((d) => {
                const height = Math.round((d.revenue / maxDay) * 100);
                return (
                  <div key={d.date} className="chart-col" title={`${dayLabel(d.date)}: ${formatVND(d.revenue)} (${d.orders} đơn)`}>
                    <span className="chart-value">
                      {d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : ""}
                    </span>
                    <div className="chart-track">
                      <div className="chart-bar" style={{ height: `${Math.max(d.revenue > 0 ? 4 : 0, height)}%` }} />
                    </div>
                    <span className="chart-label">{dayLabel(d.date)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {days.length > 0 && (
            <p className="chart-caption">
              Khung {dayLabel(days[0].date)} – {dayLabel(stats.revenue7dTo || days[days.length - 1].date)}
            </p>
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Đơn theo trạng thái</h2>
            <span className="admin-panel-total">{stats.totalOrders} đơn</span>
          </div>

          {statusRows.length === 0 ? (
            <p className="admin-empty">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="status-list">
              {statusRows.map(([status, count]) => (
                <Link
                  key={status}
                  to={`/admin/orders?status=${encodeURIComponent(status)}`}
                  className="status-row"
                >
                  <span className="status-row-name">{status}</span>
                  <div className="status-track">
                    <div className="status-fill" style={{ width: `${Math.round((count / maxStatus) * 100)}%` }} />
                  </div>
                  <span className="status-row-count">{count}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Doanh thu theo danh mục</h2>
            <span className="admin-panel-total">đơn đã thanh toán</span>
          </div>

          {categorySales.length === 0 ? (
            <p className="admin-empty">Chưa có doanh thu theo danh mục.</p>
          ) : (
            <div className="status-list">
              {categorySales.map((c) => (
                <div key={c.slug} className="status-row">
                  <span className="status-row-name category-name" title={c.label}>
                    {c.label}
                  </span>
                  <div className="status-track">
                    <div
                      className="status-fill category-fill"
                      style={{ width: `${Math.max(2, Math.round((c.revenue / maxCategoryRevenue) * 100))}%` }}
                    />
                  </div>
                  <span className="category-revenue">{formatVND(c.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Top 5 sản phẩm bán chạy</h2>
          <span className="admin-panel-total">theo số lượng đã bán</span>
        </div>

        {top.length === 0 ? (
          <p className="admin-empty">Chưa có sản phẩm nào được bán (đơn đã thanh toán).</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {top.map((p, i) => (
                  <tr key={p.name}>
                    <td className="admin-rank">{i + 1}</td>
                    <td className="admin-name">{p.name}</td>
                    <td>{p.qty}</td>
                    <td className="admin-price">{formatVND(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>Đơn hàng gần đây</h2>
          <Link className="admin-panel-link" to="/admin/orders">
            Xem tất cả →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="admin-empty">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Người mua</th>
                  <th>Sản phẩm</th>
                  <th>Trạng thái</th>
                  <th>Tổng</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o._id}>
                    <td className="admin-name">
                      <Link to={`/admin/orders?q=${o.code}`}>#{o.code}</Link>
                    </td>
                    <td>{o.userName}</td>
                    <td className="admin-desc">{o.itemNames.join(", ")}</td>
                    <td>
                      <span className="status">{o.status}</span>
                      {!o.paid && <span className="pay-badge unpaid">Chưa thu</span>}
                    </td>
                    <td className="admin-price">{formatVND(o.total)}</td>
                    <td className="admin-desc">
                      {new Date(o.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-quick">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="admin-quick-card">
            <strong>{a.label}</strong>
            <span>{a.hint}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
