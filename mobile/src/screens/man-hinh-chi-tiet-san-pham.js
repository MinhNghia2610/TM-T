import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, formatVND } from "../api";
import { useStore } from "../luu-tru";

export default function ProductDetailScreen({ id, onBack, onBuyNow }) {
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const { add } = useStore();

  useEffect(() => {
    setLoadError(null);
    api(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setLoadError(err));
  }, [id]);

  // Lỗi khi tải (vd 404 do link cũ, sản phẩm đã bị xoá, hoặc lỗi mạng):
  // báo rõ cho khách thay vì để ActivityIndicator quay mãi.
  if (loadError) {
    return (
      <View style={styles.wrap}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.error}>
          {loadError.status === 404
            ? "Không tìm thấy sản phẩm này (có thể đã bị xoá)."
            : `Không tải được sản phẩm: ${loadError.message}`}
        </Text>
      </View>
    );
  }

  if (!product) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Quay lại</Text>
      </TouchableOpacity>

      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.category}>{product.categoryLabel}</Text>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{formatVND(product.price)}</Text>
      <Text style={styles.desc}>{product.description}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primary, styles.half]}
          onPress={onBuyNow}
        >
          <Text style={styles.primaryText}>Mua ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondary, styles.half]}
          onPress={() => {
            add(product);
            Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
          }}
        >
          <Text style={styles.secondaryText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
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
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#eee",
    marginBottom: 14,
  },
  category: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    color: "#dc2626",
    fontWeight: "700",
    marginBottom: 10,
  },
  desc: {
    color: "#444",
    lineHeight: 20,
    marginBottom: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  half: {
    flex: 1,
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
  secondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#2563eb",
    fontWeight: "700",
  },
});
