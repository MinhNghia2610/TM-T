import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, formatVND } from "../api.js";
import { useCategories } from "../danh-muc.js";

// ---- Khuyến mãi trang chủ: poster + thời gian giảm giá + ưu đãi sinh viên ----
const POSTERS = [
  {
    kicker: "Giảm đến 30%",
    title: "Flash Sale Công Nghệ",
    sub: "Tai nghe, loa, phụ kiện chính hãng — số lượng có hạn.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=70",
    cta: "Xem ưu đãi âm thanh",
    to: "/?category=am-thanh",
  },
  {
    kicker: "Trợ giá mùa thi",
    title: "Laptop & Thiết Bị Học Tập",
    sub: "Laptop mỏng nhẹ, máy tính bảng và phụ kiện học online.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=70",
    cta: "Xem laptop",
    to: "/?category=laptop",
  },
  {
    kicker: "Freeship toàn quốc",
    title: "Miễn Phí Vận Chuyển",
    sub: "Cho đơn từ 500.000 ₫ — mọi tỉnh thành trong khung giờ vàng.",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=70",
    cta: "Mua sắm ngay",
    to: "/",
  },
];

// Thời gian khuyến mãi hiển thị trên trang chủ
const SALE_START = new Date("2026-11-14T00:00:00");
const SALE_END = new Date("2026-11-30T23:59:59");
const SALE_RANGE = `${SALE_START.toLocaleDateString("vi-VN")} – ${SALE_END.toLocaleDateString("vi-VN")}`;

// Nhãn đếm ngược: "Còn N ngày" / "Bắt đầu..." / "Đã kết thúc"
function saleCountdown(now) {
  if (now < SALE_START) {
    return `Bắt đầu ${SALE_START.toLocaleDateString("vi-VN")}`;
  }
  const daysLeft = Math.ceil((SALE_END - now) / (24 * 60 * 60 * 1000));
  if (daysLeft <= 0) return "Đã kết thúc";
  return `Còn ${daysLeft} ngày`;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
  { value: "name", label: "Tên A → Z" },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [poster, setPoster] = useState(0);
  const categories = useCategories();

  // ?q=, ?category=, ?sort= trên URL là nguồn sự thật của bộ lọc, nhờ vậy
  // link từ poster/footer và nút Back của trình duyệt đều hoạt động đúng.
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") || "newest";
  const currentPoster = POSTERS[poster];
  const activeCategory = categories.find((c) => c.slug === category);

  // Cập nhật một khoá trên URL mà không làm mất các bộ lọc còn lại
  function updateParams(patch) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next);
  }

  useEffect(() => {
    setSearch(q);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    const qs = params.toString();

    api(`/products${qs ? `?${qs}` : ""}`)
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]));
  }, [q, category, sort]);

  return (
    <div>
      {/* Khu khuyến mãi: chỉ hiện ở trang chủ, ẩn khi đang lọc/tìm kiếm */}
      {!q && !category && (
        <section className="promo">
          <div
            className="promo-banner"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.35)), url(${currentPoster.image})`,
            }}
          >
            <div className="promo-content">
              <span className="promo-kicker">{currentPoster.kicker}</span>
              <h2>{currentPoster.title}</h2>
              <p>{currentPoster.sub}</p>
              <Link className="promo-cta" to={currentPoster.to}>
                {currentPoster.cta}
              </Link>
            </div>
            <div className="promo-dots">
              {POSTERS.map((p, i) => (
                <button
                  key={p.title}
                  type="button"
                  className={i === poster ? "promo-dot active" : "promo-dot"}
                  onClick={() => setPoster(i)}
                  aria-label={`Xem poster ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="sale-strip">
            <span className="sale-badge">🔥 Đại tiệc giảm giá</span>
            <span className="sale-dates">{SALE_RANGE}</span>
            <span className="sale-countdown">{saleCountdown(new Date())}</span>
          </div>

          <div className="student-offer">
            <div className="student-icon">🎓</div>
            <div className="student-body">
              <h3>Ưu đãi đặc biệt cho sinh viên</h3>
              <p>
                Giảm thêm 10% cho học sinh – sinh viên khi xuất trình thẻ hoặc
                email trường (.edu.vn).
              </p>
              <ul>
                <li>Áp dụng cho đơn từ 300.000 ₫</li>
                <li>Duy nhất trong thời gian {SALE_RANGE}</li>
                <li>Xuất trình thẻ sinh viên khi nhận hàng (COD) hoặc thanh toán tại quầy</li>
              </ul>
            </div>
            <span className="student-pill">-10%</span>
          </div>
        </section>
      )}

      <div className="catalog-head">
        <div>
          <h1>{activeCategory ? activeCategory.label : "Sản phẩm"}</h1>
          <p className="catalog-sub">
            {activeCategory
              ? activeCategory.description
              : "Toàn bộ danh mục — chọn một nhóm bên dưới để thu hẹp."}
          </p>
        </div>
        <span className="catalog-total">{products.length} sản phẩm</span>
      </div>

      {/* Thanh danh mục: cùng nguồn dữ liệu với module quản trị */}
      <div className="category-rail" role="navigation" aria-label="Danh mục sản phẩm">
        <button
          type="button"
          className={!category ? "category-chip active" : "category-chip"}
          onClick={() => updateParams({ category: "" })}
        >
          Tất cả
          <span className="category-count">{categories.reduce((n, c) => n + c.count, 0)}</span>
        </button>
        {categories
          .filter((c) => c.count > 0)
          .map((c) => (
            <button
              key={c.slug}
              type="button"
              className={category === c.slug ? "category-chip active" : "category-chip"}
              onClick={() => updateParams({ category: c.slug })}
            >
              <span aria-hidden="true">{c.icon}</span> {c.label}
              <span className="category-count">{c.count}</span>
            </button>
          ))}
      </div>

      <div className="catalog-toolbar">
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ q: search.trim() });
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm..."
            aria-label="Tìm sản phẩm"
          />
          <button type="submit">Tìm</button>
        </form>

        <label className="sort-control">
          Sắp xếp
          <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(q || category) && (
        <p className="search-info">
          {q ? `Kết quả cho “${q}”` : "Đang lọc theo danh mục"}
          {q && category ? ` trong ${activeCategory?.label || category}` : ""}:{" "}
          <strong>{products.length}</strong> sản phẩm{" "}
          <button
            type="button"
            className="link"
            onClick={() => updateParams({ q: "", category: "" })}
          >
            Xoá bộ lọc
          </button>
        </p>
      )}

      <div className="grid">
        {products.map((p) => (
          <Link key={p._id} to={`/product/${p._id}`} className="card">
            {/* 70 sản phẩm: tải ảnh theo nhu cầu để trang chủ không nghẽn mạng */}
            <img src={p.image} alt={p.name} loading="lazy" />
            <div className="card-body">
              <span className="card-category">{p.categoryLabel}</span>
              <h3>{p.name}</h3>
              <p className="price">{formatVND(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <p className="empty-state">
          Không có sản phẩm nào phù hợp.{" "}
          <button type="button" className="link" onClick={() => updateParams({ q: "", category: "" })}>
            Xem tất cả sản phẩm
          </button>
        </p>
      )}
    </div>
  );
}
