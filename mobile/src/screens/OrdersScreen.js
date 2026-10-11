import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, formatVND } from "../api";
import { useStore } from "../store";

export default function OrdersScreen({ onPayOrder }) {
  const { user, token } = useStore();
  const [orders, setOrders] = useState(null);

  const loadOrders = () => {
    api("/orders")
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    if (token) loadOrders();
  }, [token]);

  function payOrder(id) {
    // Mở màn hình thanh toán chuyên biệt để chọn phương thức (COD/tiền mặt/
    // chuyển khoản/thẻ...)
    if (onPayOrder) {
      onPayOrder(id);
    }
  }

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
            {item.paymentMethod ? (
              <Text style={styles.pmMethod}>Phương thức: {item.paymentMethod}</Text>
            ) : null}
            {!item.paid ? (
              <TouchableOpacity style={styles.payBtn} onPress={() => payOrder(item._id)}>
                <Text style={styles.payText}>Thanh toán</Text>
              </TouchableOpacity>
            ) : null}
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
  pmMethod: {
    color: "#666",
    marginTop: 4,
    fontSize: 13,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
  },
  payBtn: {
    backgroundColor: "#15803d",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  payText: {
    color: "#fff",
    fontWeight: "700",
  },
});
