import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api, formatVND } from "../api.js";
import { useCart } from "../gio-hang.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoadError(null);
    setAdded(false);
    setProduct(null);
    setRelated([]);

    api(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setLoadError(err));

    // Sản phẩm cùng danh mục: lỗi ở đây chỉ làm trống khối gợi ý,
    // không được che mất trang chi tiết đang tải bình thường.
    api(`/products/${id}/related`)
      .then((data) => setRelated(data.products))
      .catch(() => setRelated([]));
  }, [id]);

  // Thêm vào giỏ: giữ nguyên trang, chỉ hiện thông báo thành công
  function addToCart() {
    add(product);
    setAdded(true);
  }

  // Mua ngay: thêm sản phẩm vào giỏ rồi chuyển thẳng tới trang giỏ hàng (checkout)
  function buyNow() {
    add(product);
    navigate("/cart");
  }

  // Lỗi khi tải (vd 404 do link cũ, sản phẩm đã bị xoá, hoặc lỗi mạng):
  // báo rõ cho khách thay vì để spinner "Đang tải..." quay mãi mãi.
  if (loadError) {
    return (
      <p>
        {loadError.status === 404
          ? "Không tìm thấy sản phẩm này (có thể đã bị xoá hoặc link không đúng)."
          : `Không tải được sản phẩm: ${loadError.message}`}{" "}
        <Link to="/">Về trang sản phẩm</Link>
      </p>
    );
  }

  if (!product) return <p>Đang tải...</p>;

  return (
    <div>
      <nav className="breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to={`/?category=${product.category}`}>{product.categoryLabel}</Link>
        <span>/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      <div className="detail">
        <img src={product.image} alt={product.name} />
        <div>
          <Link className="category-badge" to={`/?category=${product.category}`}>
            {product.categoryLabel}
          </Link>
          <h1>{product.name}</h1>
          <p className="price">{formatVND(product.price)}</p>
          <p>{product.description}</p>
          <div className="detail-actions">
            <button className="primary" onClick={buyNow}>
              Mua ngay
            </button>
            <button className="outline" onClick={addToCart}>
              Thêm vào giỏ hàng
            </button>
          </div>
          {added && <p className="added-msg">✓ Đã thêm "{product.name}" vào giỏ hàng</p>}
        </div>
      </div>

      {related.length > 0 && (
        <section className="related">
          <div className="related-head">
            <h2>Sản phẩm cùng danh mục</h2>
            <Link to={`/?category=${product.category}`}>Xem tất cả {product.categoryLabel} →</Link>
          </div>
          <div className="grid">
            {related.map((p) => (
              <Link key={p._id} to={`/product/${p._id}`} className="card">
                <img src={p.image} alt={p.name} loading="lazy" />
                <div className="card-body">
                  <h3>{p.name}</h3>
                  <p className="price">{formatVND(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
