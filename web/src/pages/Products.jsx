import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatVND } from "../api.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  async function load(q = "") {
    const data = await api(`/products${q ? `?search=${encodeURIComponent(q)}` : ""}`);
    setProducts(data.products);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Sản phẩm</h1>

      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
        />
        <button type="submit">Tìm</button>
      </form>

      <div className="grid">
        {products.map((p) => (
          <Link key={p._id} to={`/product/${p._id}`} className="card">
            <img src={p.image} alt={p.name} />
            <div className="card-body">
              <h3>{p.name}</h3>
              <p className="price">{formatVND(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && <p>Không có sản phẩm nào.</p>}
    </div>
  );
}
