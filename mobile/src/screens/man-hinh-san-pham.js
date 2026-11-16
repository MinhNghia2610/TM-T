import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api, formatVND } from "../api";

export default function ProductsScreen({ onOpen }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(q = "", cat = "") {
    setLoading(true);
    try {
      // Nối query thủ công: URLSearchParams không phải lúc nào cũng đầy đủ
      // trong môi trường React Native.
      const qs = [
        q ? `search=${encodeURIComponent(q)}` : "",
        cat ? `category=${encodeURIComponent(cat)}` : "",
      ]
        .filter(Boolean)
        .join("&");
      const data = await api(`/products${qs ? `?${qs}` : ""}`);
      setProducts(data.products);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    api("/categories")
      .then((data) => setCategories((data.categories || []).filter((c) => c.count > 0)))
      .catch(() => setCategories([]));
  }, []);

  function chooseCategory(slug) {
    setCategory(slug);
    load(search, slug);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Tìm sản phẩm..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => load(search, category)}
        />
        <TouchableOpacity style={styles.btn} onPress={() => load(search, category)}>
          <Text style={styles.btnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Danh mục lấy từ cùng API với web và module quản trị */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <TouchableOpacity
          style={[styles.chip, !category && styles.chipActive]}
          onPress={() => chooseCategory("")}
        >
          <Text style={[styles.chipText, !category && styles.chipTextActive]}>Tất cả</Text>
        </TouchableOpacity>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.slug}
            style={[styles.chip, category === c.slug && styles.chipActive]}
            onPress={() => chooseCategory(c.slug)}
          >
            <Text style={[styles.chipText, category === c.slug && styles.chipTextActive]}>
              {c.icon} {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => String(p._id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => onOpen(item._id)}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.category}>{item.categoryLabel}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{formatVND(item.price)}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Không có sản phẩm nào.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 14,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d0d4dc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  btnText: {
    color: "#fff",
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d0d4dc",
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipText: {
    color: "#374151",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  category: {
    fontSize: 11,
    color: "#2563eb",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    color: "#dc2626",
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#666",
  },
});
