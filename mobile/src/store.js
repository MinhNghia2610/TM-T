import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setToken } from "./api";

const StoreContext = createContext(null);

// Một store duy nhất gồm: đăng nhập (user + token) và giỏ hàng, lưu bằng AsyncStorage
export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState("");
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  // Nạp dữ liệu đã lưu từ lần chạy trước
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedUser = await AsyncStorage.getItem("user");
        const savedCart = await AsyncStorage.getItem("cart");
        if (savedToken) {
          setTokenState(savedToken);
          setToken(savedToken);
        }
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedCart) setItems(JSON.parse(savedCart));
      } catch {
        // bỏ qua lỗi đọc storage
      }
      setReady(true);
    })();
  }, []);

  // Lưu giỏ hàng mỗi khi thay đổi
  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(items)).catch(() => {});
  }, [items]);

  function login(authData) {
    setTokenState(authData.token);
    setToken(authData.token);
    setUser(authData.user);
    AsyncStorage.setItem("token", authData.token).catch(() => {});
    AsyncStorage.setItem("user", JSON.stringify(authData.user)).catch(() => {});
  }

  function logout() {
    setTokenState("");
    setToken("");
    setUser(null);
    AsyncStorage.multiRemove(["token", "user"]).catch(() => {});
  }

  function add(product) {
    setItems((prev) => {
      const found = prev.find((i) => i.productId === product._id);
      if (found) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: 1,
        },
      ];
    });
  }

  function updateQty(productId, qty) {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function remove(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (!ready) return null; // chờ đọc storage xong

  return (
    <StoreContext.Provider
      value={{ user, token, login, logout, items, add, updateQty, remove, clear, total }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
