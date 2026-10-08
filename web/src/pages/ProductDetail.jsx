import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, formatVND } from "../api.js";
import { useCart } from "../cart.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) return <p>Đang tải...</p>;

  return (
    <div className="detail">
      <img src={product.image} alt={product.name} />
      <div>
        <h1>{product.name}</h1>
        <p className="price">{formatVND(product.price)}</p>
        <p>{product.description}</p>
        <button
          className="primary"
          onClick={() => {
            add(product);
            navigate("/cart");
          }}
        >
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
}
