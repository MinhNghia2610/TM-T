import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, formatVND } from "../api";

// Màn hình thanh toán chuyên biệt: xem đơn hàng, chọn phương thức (COD/ tiền mặt /
// chuyển khoản / thẻ...) rồi xác nhận. onDone -> quay lại danh sách đơn.
export default function PaymentScreen({ orderId, onDone }) {
  const [order, setOrder] = useState(null);
  const [methods, setMethods] = useState([]);
  const [selected, setSelected] = useState(null); // code của phương thức đang chọn
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api(`/orders/${orderId}`)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message));
  }, [orderId]);

  useEffect(() => {
    api("/payment-methods")
      .then((data) => setMethods(data.methods || []))
      .catch(() => setMethods([]));
  }, []);

  async function confirmPay() {
    if (!selected) {
      setError("Vui lòng chọn một phương thức thanh toán.");
      return;
    }
    setError("");
    setPaying(true);
    try {
      await api(`/orders/${orderId}/pay`, { method: "POST", body: { method: selected } });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  }

  if (error && !order) {
    return (
      <View style={styles.wrap}>
        <TouchableOpacity onPress={onDone}>
          <Text style={styles.back}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!order) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (order.paid) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.empty}>Đơn hàng này đã được thanh toán.</Text>
        <TouchableOpacity style={styles.primary} onPress={onDone}>
          <Text style={styles.primaryText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedMethod = methods.find((m) => m.code === selected);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <TouchableOpacity onPress={onDone}>
        <Text style={styles.back}>← Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Thanh toán đơn hàng</Text>

      <View style={styles.card}>
        <Text style={styles.orderId}>#{String(order._id).slice(-6).toUpperCase()}</Text>
        <Text style={styles.status}>{order.status}</Text>
        {order.items.map((i) => (
          <Text key={String(i.productId)} style={styles.line}>
            • {i.name} × {i.qty} — {formatVND(i.price * i.qty)}
          </Text>
        ))}
        <Text style={styles.total}>Tổng cần thanh toán: {formatVND(order.total)}</Text>
      </View>

      <Text style={styles.section}>Chọn phương thức thanh toán</Text>

      {methods.map((m) => (
        <TouchableOpacity
          key={m.code}
          style={[styles.method, selected === m.code && styles.methodActive]}
          onPress={() => setSelected(m.code)}
        >
          <Text style={styles.methodLabel}>{m.label}</Text>
          <Text style={styles.methodDesc}>{m.description}</Text>
          {m.bank ? (
            <Text style={styles.bankInfo}>
              {m.bank.bankLabel} — STK: {m.bank.accountNumber} — {m.bank.accountName}{"\n"}
              Chi nhánh: {m.bank.branch}
            </Text>
          ) : null}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.primary, paying && { opacity: 0.6 }]}
        disabled={paying}
        onPress={confirmPay}
      >
        <Text style={styles.primaryText}>
          {paying
            ? "Đang xử lý..."
            : selectedMethod && selectedMethod.code === "COD"
            ? "Đặt hàng COD (xác nhận)"
            : "Xác nhận thanh toán"}
        </Text>
      </TouchableOpacity>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 14,
    paddingBottom: 30,
  },
  back: {
    color: "#2563eb",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  orderId: {
    fontWeight: "700",
  },
  status: {
    color: "#15803d",
    backgroundColor: "#dcfce7",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
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
  section: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  method: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  methodActive: {
    borderColor: "#2563eb",
    borderWidth: 2,
  },
  methodLabel: {
    fontWeight: "600",
  },
  methodDesc: {
    color: "#666",
    marginTop: 2,
  },
  bankInfo: {
    marginTop: 6,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 8,
    color: "#1c1e21",
  },
  primary: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  error: {
    color: "#dc2626",
    marginTop: 10,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
    marginBottom: 12,
  },
});
