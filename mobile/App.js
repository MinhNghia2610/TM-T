import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { StoreProvider } from "./src/store";
import ProductsScreen from "./src/screens/ProductsScreen";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";
import CartScreen from "./src/screens/CartScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import LoginScreen from "./src/screens/LoginScreen";

const TABS = [
  { key: "products", label: "Sản phẩm" },
  { key: "cart", label: "Giỏ hàng" },
  { key: "orders", label: "Đơn" },
  { key: "login", label: "Tài khoản" },
];

// Điều hướng đơn giản bằng state (không dùng thư viện điều hướng)
export default function App() {
  const [tab, setTab] = useState("products");
  const [productId, setProductId] = useState(null); // nếu có -> đang xem chi tiết sản phẩm
  const [paymentOrderId, setPaymentOrderId] = useState(null); // nếu có -> đang ở màn thanh toán

  let screen;
  if (tab === "products" && productId) {
    screen = <ProductDetailScreen id={productId} onBack={() => setProductId(null)} />;
  } else if (paymentOrderId) {
    screen = (
      <PaymentScreen
        orderId={paymentOrderId}
        onDone={() => {
          setPaymentOrderId(null);
          setTab("orders");
        }}
      />
    );
  } else {
    switch (tab) {
      case "cart":
        screen = <CartScreen onGoTab={setTab} onPayOrder={setPaymentOrderId} />;
        break;
      case "orders":
        screen = <OrdersScreen onPayOrder={setPaymentOrderId} />;
        break;
      case "login":
        screen = <LoginScreen onGoTab={setTab} />;
        break;
      default:
        screen = <ProductsScreen onOpen={setProductId} />;
    }
  }

  return (
    <StoreProvider>
      <View style={styles.app}>
        <StatusBar style="dark" />
        <View style={styles.screen}>{screen}</View>

        <View style={styles.tabbar}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={styles.tab}
              onPress={() => {
                setTab(t.key);
                setProductId(null);
                setPaymentOrderId(null);
              }}
            >
              <Text style={[styles.tabLabel, tab === t.key && styles.tabActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  screen: {
    flex: 1,
  },
  tabbar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#d0d4dc",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  tabLabel: {
    fontSize: 14,
    color: "#666",
  },
  tabActive: {
    color: "#2563eb",
    fontWeight: "700",
  },
});
