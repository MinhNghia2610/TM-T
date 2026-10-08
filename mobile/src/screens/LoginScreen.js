import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api";
import { useStore } from "../store";

export default function LoginScreen({ onGoTab }) {
  const { user, login, logout } = useStore();
  const [mode, setMode] = useState("login"); // "login" hoặc "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    try {
      const data =
        mode === "login"
          ? await api("/auth/login", { method: "POST", body: { email, password } })
          : await api("/auth/register", { method: "POST", body: { name, email, password } });
      login(data);
      onGoTab("products");
    } catch (err) {
      setError(err.message);
    }
  }

  // Đã đăng nhập -> hiện thông tin + nút đăng xuất
  if (user) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Xin chào, {user.name} 👋</Text>
        <Text style={styles.sub}>{user.email}</Text>
        <TouchableOpacity style={styles.primary} onPress={logout}>
          <Text style={styles.primaryText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{mode === "login" ? "Đăng nhập" : "Đăng ký"}</Text>

      {mode === "register" && (
        <TextInput
          style={styles.input}
          placeholder="Tên của bạn"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.primary} onPress={submit}>
        <Text style={styles.primaryText}>
          {mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </Text>
      </TouchableOpacity>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        onPress={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
        }}
      >
        <Text style={styles.switchText}>
          {mode === "login"
            ? "Chưa có tài khoản? Đăng ký ngay"
            : "Đã có tài khoản? Đăng nhập"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  sub: {
    color: "#666",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d4dc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primary: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  error: {
    color: "#dc2626",
  },
  switchText: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 4,
  },
});
