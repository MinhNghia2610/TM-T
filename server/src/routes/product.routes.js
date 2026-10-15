const { ObjectId } = require("mongodb");
const { getDb } = require("../db");
const { sendJson } = require("../lib/http");

module.exports.register = function register(router) {
  // GET /api/products?search=tên
  router.add("GET", "/api/products", async ({ res, query }) => {
    const search = query.get("search");
    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const products = await getDb()
      .collection("products")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

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

    sendJson(res, 200, { product });
  });
};

// ---- Các route quản trị (cần token có role "admin") ----

// Validate dữ liệu sản phẩm gửi lên, trả về { ok, value } hoặc { ok: false, message }
function parseProductInput(body) {
  const name = String((body && body.name) || "").trim();
  const description = String((body && body.description) || "").trim();
  const image = String((body && body.image) || "").trim();
  const price = Number(body && body.price);

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

  return { ok: true, value: { name, description, image, price, createdAt: new Date() } };
}

module.exports.registerAdmin = function registerAdmin(router) {
  // POST /api/products  { name, price, image, description? }  (admin)
  router.add(
    "POST",
    "/api/products",
    async ({ res, body }) => {
      const parsed = parseProductInput(body);
      if (!parsed.ok) {
        return sendJson(res, 400, { message: parsed.message });
      }

      const result = await getDb().collection("products").insertOne(parsed.value);
      sendJson(res, 201, { product: { _id: result.insertedId, ...parsed.value } });
    },
    { admin: true }
  );

  // PUT /api/products/:id  { name, price, image, description? }  (admin)
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

      sendJson(res, 200, { product });
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
