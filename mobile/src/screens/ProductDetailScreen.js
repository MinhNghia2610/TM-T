import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { api, formatVND } from "../api";
import { useStore } from "../store";

export default function ProductDetailScreen({ id, onBack }) {
  const [product, setProduct] = useState(null);
  const { add } = useStore();

  useEffect(() => {
    api(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Quay lại</Text>
      </TouchableOpacity>

      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{formatVND(product.price)}</Text>
      <Text style={styles.desc}>{product.description}</Text>

      <TouchableOpacity
        style={styles.primary}
        onPress={() => {
          add(product);
          Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
        }}
      >
        <Text style={styles.primaryText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>
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
});
