import { useEffect, useState } from "react";
import { api, formatVND } from "../api.js";
import { useCategories } from "../danh-muc.js";

// Trang quản trị sản phẩm: thêm / sửa / xoá.
// Việc chặn truy cập đã nằm ở AdminLayout (và server kiểm tra lại bằng token).
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const categories = useCategories();

  // Bộ lọc danh sách (không ảnh hưởng form thêm/sửa)
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Form dùng chung cho cả thêm và sửa: editingId rỗng -> đang thêm mới
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", image: "", description: "", category: "" });

  function load() {
    setLoading(true);
    api("/products")
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function resetForm() {
    setEditingId(null);
    setForm({ name: "", price: "", image: "", description: "", category: "" });
    setError("");
  }

  function startEdit(p) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: String(p.price),
      image: p.image,
      description: p.description || "",
      category: p.category || "khac",
    });
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    const payload = {
      name: form.name,
      price: Number(form.price),
      image: form.image,
      description: form.description,
      category: form.category || "khac",
    };

    try {
      if (editingId) {
        await api(`/products/${editingId}`, { method: "PUT", body: payload });
        setNotice(`Đã cập nhật sản phẩm “${form.name.trim()}”.`);
      } else {
        await api("/products", { method: "POST", body: payload });
        setNotice(`Đã thêm sản phẩm “${form.name.trim()}”.`);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(p) {
    if (!window.confirm(`Xoá sản phẩm “${p.name}”? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await api(`/products/${p._id}`, { method: "DELETE" });
      setNotice(`Đã xoá sản phẩm “${p.name}”.`);
      if (editingId === p._id) resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const needle = search.trim().toLowerCase();
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== "ALL" && (p.category || "khac") !== categoryFilter) return false;
    if (!needle) return true;
    return `${p.name} ${p.categoryLabel || ""}`.toLowerCase().includes(needle);
  });

  return (
    <div>
      <h1>Sản phẩm</h1>

      {notice && <p className="notice">{notice}</p>}
      {error && <p className="error">{error}</p>}

      <form className="admin-form card-form" onSubmit={submit}>
        <h2>{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
        <label>
          Tên sản phẩm *
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Tai nghe bluetooth..."
            required
          />
        </label>
        <label>
          Giá (VND) *
          <input
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="VD: 1290000"
            required
          />
        </label>
        <label>
          Ảnh (URL) *
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://..."
            required
          />
        </label>
        <label>
          Danh mục *
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">— Chọn danh mục —</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mô tả
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả ngắn về sản phẩm..."
          />
        </label>
        <div className="admin-form-actions">
          <button type="submit" className="primary">
            {editingId ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Huỷ sửa
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-list-title">Danh sách sản phẩm</h2>

      {!loading && products.length > 0 && (
        <>
          <div className="filter-bar">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              aria-label="Tìm sản phẩm"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Lọc theo danh mục"
            >
              <option value="ALL">Tất cả danh mục ({products.length})</option>
              {categories
                .map((c) => ({ ...c, count: products.filter((p) => (p.category || "khac") === c.slug).length }))
                .filter((c) => c.count > 0)
                .map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label} ({c.count})
                  </option>
                ))}
            </select>
          </div>
          <p className="filter-summary">
            Hiển thị <strong>{filteredProducts.length}</strong>/{products.length} sản phẩm
          </p>
        </>
      )}

      {loading ? (
        <p>Đang tải...</p>
      ) : filteredProducts.length === 0 ? (
        <p>Không có sản phẩm nào khớp bộ lọc.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th className="admin-actions-col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id} className={editingId === p._id ? "editing" : ""}>
                  <td>
                    <img src={p.image} alt={p.name} className="admin-thumb" />
                  </td>
                  <td>
                    <div className="admin-name">{p.name}</div>
                    {p.description && <div className="admin-desc">{p.description}</div>}
                  </td>
                  <td>
                    <span className="category-badge category-badge-sm">{p.categoryLabel}</span>
                  </td>
                  <td className="admin-price">{formatVND(p.price)}</td>
                  <td className="admin-actions-col">
                    <button onClick={() => startEdit(p)}>Sửa</button>{" "}
                    <button className="danger" onClick={() => remove(p)}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
