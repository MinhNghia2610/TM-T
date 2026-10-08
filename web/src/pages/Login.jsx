import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" hoặc "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const data =
        mode === "login"
          ? await api("/auth/login", {
              method: "POST",
              body: { email: form.email, password: form.password },
            })
          : await api("/auth/register", { method: "POST", body: form });
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <h1>{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h1>

      <form onSubmit={submit} className="auth-form">
        {mode === "register" && (
          <input
            placeholder="Tên của bạn"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
        <input
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          type="password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          required
        />
        <button className="primary" type="submit">
          {mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <p>
        {mode === "login" ? (
          <>
            Chưa có tài khoản?{" "}
            <button className="link" onClick={() => setMode("register")}>
              Đăng ký ngay
            </button>
          </>
        ) : (
          <>
            Đã có tài khoản?{" "}
            <button className="link" onClick={() => setMode("login")}>
              Đăng nhập
            </button>
          </>
        )}
      </p>
    </div>
  );
}
