import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { api, formatVND } from "../api";
import { useStore } from "../store";

export default function OrdersScreen() {
  const { user, token } = useStore();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (token) {
      api("/orders")
        .then((data) => setOrders(data.orders))
        .catch(() => setOrders([]));
    }
  }, [token]);

  if (!user) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.empty}>Bạn cần đăng nhập để xem đơn hàng.</Text>
      </View>
    );
  }

  if (!orders) {
    return (
      <View style={styles.wrap}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o._id)}
        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.orderId}>#{String(item._id).slice(-6).toUpperCase()}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            {item.items.map((i) => (
              <Text key={String(i.productId)} style={styles.line}>
                • {i.name} × {i.qty} — {formatVND(i.price * i.qty)}
              </Text>
            ))}
            <Text style={styles.total}>Tổng: {formatVND(item.total)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có đơn hàng nào.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontWeight: "700",
  },
  status: {
    color: "#15803d",
    backgroundColor: "#dcfce7",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
  },
  line: {
    color: "#444",
    marginBottom: 2,
  },
  total: {
    fontWeight: "700",
    textAlign: "right",
    marginTop: 6,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
  },
});
