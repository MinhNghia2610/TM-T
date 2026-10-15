import { useEffect, useState } from "react";
import { api, formatVND } from "../api.js";

// Trang quản trị sản phẩm: thêm / sửa / xoá.
// Việc chặn truy cập đã nằm ở AdminLayout (và server kiểm tra lại bằng token).
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  // Form dùng chung cho cả thêm và sửa: editingId rỗng -> đang thêm mới
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", image: "", description: "" });

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
    setForm({ name: "", price: "", image: "", description: "" });
    setError("");
  }

  function startEdit(p) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: String(p.price),
      image: p.image,
      description: p.description || "",
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

      <h2 className="admin-list-title">Danh sách sản phẩm ({products.length})</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : products.length === 0 ? (
        <p>Chưa có sản phẩm nào.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Giá</th>
                <th className="admin-actions-col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className={editingId === p._id ? "editing" : ""}>
                  <td>
                    <img src={p.image} alt={p.name} className="admin-thumb" />
                  </td>
                  <td>
                    <div className="admin-name">{p.name}</div>
                    {p.description && <div className="admin-desc">{p.description}</div>}
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
