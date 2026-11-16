import { useEffect, useState } from "react";
import { api } from "./api.js";

// Danh mục sản phẩm dùng chung cho trang chủ, footer và module quản trị.
// Cache ở cấp module: dù nhiều component cùng gọi, chỉ có một request /categories
// được gửi đi trong một phiên.
let cache = null;
let pending = null;

export function useCategories() {
  const [categories, setCategories] = useState(cache || []);

  useEffect(() => {
    // Cache đã có thì state khởi tạo từ cache là đủ, không cần setState lại
    if (cache) return;
    if (!pending) {
      pending = api("/categories")
        .then((data) => {
          cache = data.categories || [];
          return cache;
        })
        .catch(() => []);
    }
    let active = true;
    pending.then((list) => {
      if (active) setCategories(list);
    });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}

// Nhãn của một slug, dùng khi chỉ có slug trong tay (ví dụ từ URL)
export function categoryLabelOf(categories, slug) {
  return categories.find((c) => c.slug === slug)?.label || "Tất cả sản phẩm";
}
