import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, formatVND } from "../api.js";
import { useCart } from "../cart.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch(() => setProduct(null));
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
