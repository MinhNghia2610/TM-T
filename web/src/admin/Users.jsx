import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

// Trang quản trị người dùng: xem danh sách, gán/thu hồi quyền admin.
export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    api("/admin/users")
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function toggleRole(u) {
    const nextRole = u.role === "admin" ? "user" : "admin";
    setError("");
    setNotice("");
    try {
      await api(`/admin/users/${u._id}/role`, { method: "PUT", body: { role: nextRole } });
      setNotice(
        nextRole === "admin"
          ? `Đã cấp quyền quản trị cho ${u.name}. Người đó cần đăng nhập lại để nhận quyền.`
          : `Đã thu hồi quyền quản trị của ${u.name}.`
      );
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !users) return <p className="error">{error}</p>;
  if (!users) return <p>Đang tải...</p>;

  return (
    <div>
      <h1>Người dùng</h1>
      <p className="admin-sub">Tài khoản trong hệ thống. Không thể tự thay đổi quyền của chính mình.</p>
      {error && <p className="error">{error}</p>}
      {notice && <p className="notice">{notice}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Quyền</th>
              <th>Ngày tạo</th>
              <th className="admin-actions-col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="admin-name">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={u.role === "admin" ? "role-badge role-admin" : "role-badge"}>
                    {u.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="admin-actions-col">
                  {user && String(user.id) === String(u._id) ? (
                    <em className="admin-self-note">(bạn)</em>
                  ) : (
                    <button
                      className={u.role === "admin" ? "danger" : "primary"}
                      onClick={() => toggleRole(u)}
                    >
                      {u.role === "admin" ? "Thu hồi quyền" : "Cấp quyền admin"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
