import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, formatVND } from "../api.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // ?q= trên URL (từ ô tìm kiếm ở navbar) là nguồn sự thật của từ khoá tìm kiếm
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";

  useEffect(() => {
    setSearch(q);
    api(`/products${q ? `?search=${encodeURIComponent(q)}` : ""}`)
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]));
  }, [q]);

  return (
    <div>
      <h1>Sản phẩm</h1>

      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          setSearchParams(search.trim() ? { q: search.trim() } : {});
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
        />
        {q && (
          <button type="button" className="link" onClick={() => setSearchParams({})}>
            Xoá tìm kiếm
          </button>
        )}
        <button type="submit">Tìm</button>
      </form>

      {q && <p className="search-info">Kết quả cho “{q}”: {products.length} sản phẩm</p>}

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
