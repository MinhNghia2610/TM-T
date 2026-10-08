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
