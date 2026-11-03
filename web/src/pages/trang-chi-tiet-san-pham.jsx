import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api, formatVND } from "../api.js";
import { useCart } from "../gio-hang.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoadError(null);
    setAdded(false);
    api(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setLoadError(err));
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
    <div className="detail">
      <img src={product.image} alt={product.name} />
      <div>
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
  );
}
