import { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, formatVND } from "../api";
import { useStore } from "../store";

export default function CartScreen({ onGoTab }) {
  const { items, updateQty, remove, clear, total, user } = useStore();
  const [error, setError] = useState("");

  async function placeOrder() {
    setError("");
    try {
      await api("/orders", {
        method: "POST",
        body: {
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        },
      });
      clear();
      onGoTab("orders");
    } catch (err) {
      setError(err.message);
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.empty}>Giỏ hàng trống.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.productId)}
        contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>
                {formatVND(item.price)} × {item.qty}
              </Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => updateQty(item.productId, item.qty - 1)}
              >
                <Text>−</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.qty}</Text>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => updateQty(item.productId, item.qty + 1)}
              >
                <Text>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallBtn, styles.removeBtn]}
                onPress={() => remove(item.productId)}
              >
                <Text style={styles.removeText}>Xoá</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalText}>Tổng: {formatVND(total)}</Text>
        {user ? (
          <TouchableOpacity style={styles.primary} onPress={placeOrder}>
            <Text style={styles.primaryText}>Đặt hàng</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primary} onPress={() => onGoTab("login")}>
            <Text style={styles.primaryText}>Đăng nhập để đặt hàng</Text>
          </TouchableOpacity>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 14,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: 2,
  },
  sub: {
    color: "#666",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  smallBtn: {
    borderWidth: 1,
    borderColor: "#d0d4dc",
    borderRadius: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeBtn: {
    backgroundColor: "#fee2e2",
    borderColor: "#f3b4b4",
  },
  removeText: {
    color: "#dc2626",
  },
  qty: {
    minWidth: 18,
    textAlign: "center",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700",
  },
  primary: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  error: {
    color: "#dc2626",
    marginTop: 8,
  },
});
