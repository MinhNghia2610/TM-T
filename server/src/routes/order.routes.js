const { ObjectId } = require("mongodb");
const { getDb } = require("../db");
const { sendJson } = require("../lib/http");

module.exports.register = function register(router) {
  // POST /api/orders  { items: [{ productId, qty }] }  (cần đăng nhập)
  router.add(
    "POST",
    "/api/orders",
    async ({ res, body, user }) => {
      const { items } = body || {};
      if (!Array.isArray(items) || items.length === 0) {
        return sendJson(res, 400, { message: "Giỏ hàng trống" });
      }

      const db = getDb();

      // Lấy giá thật từ DB, không tin giá do client gửi lên
      const ids = [];
      for (const item of items) {
        try {
          ids.push(new ObjectId(item.productId));
        } catch {
          // bỏ qua id sai
        }
      }
      const found = await db
        .collection("products")
        .find({ _id: { $in: ids } })
        .toArray();
      const byId = new Map(found.map((p) => [String(p._id), p]));

      const orderItems = [];
      for (const item of items) {
        const product = byId.get(String(item.productId));
        if (!product) continue;
        const qty = Math.max(1, Math.min(99, Number(item.qty) || 1));
        orderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          qty,
        });
      }

      if (orderItems.length === 0) {
        return sendJson(res, 400, { message: "Không có sản phẩm hợp lệ trong giỏ" });
      }

      const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
      const createdAt = new Date();

      const result = await db.collection("orders").insertOne({
        userId: user.userId,
        items: orderItems,
        total,
        status: "MỚI",
        createdAt,
      });

      sendJson(res, 201, {
        order: { _id: String(result.insertedId), items: orderItems, total, status: "MỚI", createdAt },
      });
    },
    { auth: true }
  );

  // GET /api/orders  (đơn của chính user đang đăng nhập)
  router.add(
    "GET",
    "/api/orders",
    async ({ res, user }) => {
      const orders = await getDb()
        .collection("orders")
        .find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .toArray();

      sendJson(res, 200, { orders });
    },
    { auth: true }
  );
};
