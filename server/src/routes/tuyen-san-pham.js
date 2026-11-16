const { ObjectId } = require("mongodb");
const { getDb } = require("../co-so-du-lieu");
const { sendJson } = require("../lib/http");
const {
  CATEGORIES,
  DEFAULT_CATEGORY,
  isValidCategory,
  categoryLabel,
} = require("../lib/danh-muc-san-pham");

// Ký tự đặc biệt của regex ( "(", "[", "+"...) phải được escape — nếu truyền
// thẳng vào $regex, một dấu "(" của khách gõ sẽ làm MongoDB ném lỗi cú pháp
// và server trả về "Lỗi server" thay vì kết quả tìm kiếm.
function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Các kiểu sắp xếp cho phép ở trang sản phẩm (khoá trên URL -> sort của Mongo)
const SORTS = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  name: { name: 1 },
};

// Gắn thêm nhãn danh mục để web/mobile không phải tự tra cứu
function withCategory(p) {
  return {
    ...p,
    category: p.category || DEFAULT_CATEGORY,
    categoryLabel: categoryLabel(p.category),
  };
}

module.exports.register = function register(router) {
  // GET /api/categories — danh mục kèm số lượng sản phẩm thực tế
  router.add("GET", "/api/categories", async ({ res }) => {
    const groups = await getDb()
      .collection("products")
      .aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
      .toArray();
    const countBySlug = new Map(groups.map((g) => [g._id || DEFAULT_CATEGORY, g.count]));

    const categories = CATEGORIES.map((c) => ({
      ...c,
      count: countBySlug.get(c.slug) || 0,
    }));

    sendJson(res, 200, { categories });
  });

  // GET /api/products?search=tên&category=slug&sort=newest&limit=12
  router.add("GET", "/api/products", async ({ res, query }) => {
    const search = query.get("search");
    const category = query.get("category");
    const sort = SORTS[query.get("sort")] || SORTS.newest;

    const filter = {};
    if (search) {
      filter.name = { $regex: escapeRegExp(search), $options: "i" };
    }
    if (category && category !== "all") {
      // "khac" còn phải bắt cả sản phẩm cũ chưa có trường category
      filter.category = category === DEFAULT_CATEGORY ? { $in: [DEFAULT_CATEGORY, null] } : category;
    }

    const limitRaw = Number(query.get("limit"));
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(200, Math.round(limitRaw)) : 0;

    let cursor = getDb().collection("products").find(filter).sort(sort);
    if (limit) cursor = cursor.limit(limit);

    const products = (await cursor.toArray()).map(withCategory);
    sendJson(res, 200, { products });
  });

  // GET /api/products/:id
  router.add("GET", "/api/products/:id", async ({ res, params }) => {
    let id;
    try {
      id = new ObjectId(params.id);
    } catch {
      return sendJson(res, 400, { message: "id không hợp lệ" });
    }

    const product = await getDb().collection("products").findOne({ _id: id });
    if (!product) {
      return sendJson(res, 404, { message: "Không tìm thấy sản phẩm" });
    }

    sendJson(res, 200, { product: withCategory(product) });
  });

  // GET /api/products/:id/related — sản phẩm cùng danh mục cho trang chi tiết
  router.add("GET", "/api/products/:id/related", async ({ res, params, query }) => {
    let id;
    try {
      id = new ObjectId(params.id);
    } catch {
      return sendJson(res, 400, { message: "id không hợp lệ" });
    }

    const products = getDb().collection("products");
    const product = await products.findOne({ _id: id });
    if (!product) {
      return sendJson(res, 404, { message: "Không tìm thấy sản phẩm" });
    }

    const limitRaw = Number(query.get("limit"));
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(12, Math.round(limitRaw)) : 4;

    const related = await products
      .find({
        _id: { $ne: id },
        category: product.category || DEFAULT_CATEGORY,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    sendJson(res, 200, { products: related.map(withCategory) });
  });
};

// ---- Các route quản trị (cần token có role "admin") ----

// Validate dữ liệu sản phẩm gửi lên, trả về { ok, value } hoặc { ok: false, message }
function parseProductInput(body) {
  const name = String((body && body.name) || "").trim();
  const description = String((body && body.description) || "").trim();
  const image = String((body && body.image) || "").trim();
  const price = Number(body && body.price);
  const category = String((body && body.category) || "").trim() || DEFAULT_CATEGORY;

  if (!name) return { ok: false, message: "Sản phẩm phải có tên" };
  if (name.length > 100) return { ok: false, message: "Tên sản phẩm tối đa 100 ký tự" };
  if (!Number.isFinite(price) || price < 0 || Math.round(price) !== price) {
    return { ok: false, message: "Giá phải là số nguyên không âm (VND)" };
  }
  if (!image) return { ok: false, message: "Sản phẩm phải có ảnh (URL)" };
  try {
    new URL(image);
  } catch {
    return { ok: false, message: "Ảnh phải là URL hợp lệ" };
  }
  if (!isValidCategory(category)) {
    return { ok: false, message: "Danh mục sản phẩm không hợp lệ" };
  }

  return { ok: true, value: { name, description, image, price, category, createdAt: new Date() } };
}

module.exports.registerAdmin = function registerAdmin(router) {
  // POST /api/products  { name, price, image, description?, category? }  (admin)
  router.add(
    "POST",
    "/api/products",
    async ({ res, body }) => {
      const parsed = parseProductInput(body);
      if (!parsed.ok) {
        return sendJson(res, 400, { message: parsed.message });
      }

      const result = await getDb().collection("products").insertOne(parsed.value);
      sendJson(res, 201, { product: withCategory({ _id: result.insertedId, ...parsed.value }) });
    },
    { admin: true }
  );

  // PUT /api/products/:id  { name, price, image, description?, category? }  (admin)
  router.add(
    "PUT",
    "/api/products/:id",
    async ({ res, params, body }) => {
      let id;
      try {
        id = new ObjectId(params.id);
      } catch {
        return sendJson(res, 400, { message: "id không hợp lệ" });
      }

      const parsed = parseProductInput(body);
      if (!parsed.ok) {
        return sendJson(res, 400, { message: parsed.message });
      }

      const product = await getDb()
        .collection("products")
        .findOneAndUpdate({ _id: id }, { $set: parsed.value }, { returnDocument: "after" });
      if (!product) {
        return sendJson(res, 404, { message: "Không tìm thấy sản phẩm" });
      }

      sendJson(res, 200, { product: withCategory(product) });
    },
    { admin: true }
  );

  // DELETE /api/products/:id  (admin)
  router.add(
    "DELETE",
    "/api/products/:id",
    async ({ res, params }) => {
      let id;
      try {
        id = new ObjectId(params.id);
      } catch {
        return sendJson(res, 400, { message: "id không hợp lệ" });
      }

      const result = await getDb().collection("products").deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        return sendJson(res, 404, { message: "Không tìm thấy sản phẩm" });
      }

      sendJson(res, 200, { message: "Đã xoá sản phẩm" });
    },
    { admin: true }
  );
};
