const { ObjectId } = require("mongodb");
const { getDb } = require("../db");
const { sendJson } = require("../lib/http");
const { PAYMENT_METHODS, isValidMethod, getMethod } = require("./payment-methods");

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
        paid: false,
        createdAt,
      });

      sendJson(res, 201, {
        order: {
          _id: String(result.insertedId),
          items: orderItems,
          total,
          status: "MỚI",
          paid: false,
          createdAt,
        },
      });
    },
    { auth: true }
  );

  // GET /api/orders/:id  (cần đăng nhập, chỉ chủ đơn)
  // Dùng cho trang thanh toán chuyên biệt: nạp 1 đơn để hiển thị + trả tiền
  router.add(
    "GET",
    "/api/orders/:id",
    async ({ res, params, user }) => {
      let orderId;
      try {
        orderId = new ObjectId(params.id);
      } catch {
        return sendJson(res, 400, { message: "Id đơn hàng không hợp lệ" });
      }

      const order = await getDb().collection("orders").findOne({
        _id: orderId,
        userId: user.userId, // chỉ chủ đơn được xem
      });
      if (!order) {
        return sendJson(res, 404, { message: "Không tìm thấy đơn hàng" });
      }

      sendJson(res, 200, { order });
    },
    { auth: true }
  );

  // POST /api/orders/:id/pay  { method: "COD" | "CASH" | "BANK_TRANSFER" | "CARD" }  (cần đăng nhập)
  // Mô phỏng thanh toán: đánh dấu đơn là đã trả tiền nếu thuộc đúng chủ đơn.
  router.add(
    "POST",
    "/api/orders/:id/pay",
    async ({ res, params, body, user }) => {
      const method = String((body && body.method) || "").toUpperCase();
      if (!isValidMethod(method)) {
        return sendJson(res, 400, {
          message: `Phương thức không hợp lệ (hỗ trợ: ${PAYMENT_METHODS.map((m) => m.code).join(", ")})`,
        });
      }
      const methodMeta = getMethod(method);

      let orderId;
      try {
        orderId = new ObjectId(params.id);
      } catch {
        return sendJson(res, 400, { message: "Id đơn hàng không hợp lệ" });
      }

      const db = getDb();
      const order = await db.collection("orders").findOne({
        _id: orderId,
        userId: user.userId, // chỉ chủ đơn được thanh toán đơn của mình
      });
      if (!order) {
        return sendJson(res, 404, { message: "Không tìm thấy đơn hàng" });
      }
      if (order.paid) {
        return sendJson(res, 409, { message: "Đơn hàng đã được thanh toán rồi" });
      }

      // COD: chưa thu tiền ngay, đơn chuyển sang trạng thái chờ giao hàng.
      // Các phương thức còn lại: mô phỏng cổng thanh toán luôn thành công.
      // Khi gắn cổng thật (Stripe/MoMo/VNPay...), thay khối này bằng lời gọi cổng,
      // chỉ cập nhật đơn khi cổng trả về thành công.
      const paidAt = new Date();

      if (method === "COD") {
        await db.collection("orders").updateOne(
          { _id: orderId, userId: user.userId, paid: false },
          {
            $set: {
              status: "CHỜ GIAO HÀNG",
              paymentMethod: method,
              codSelectedAt: paidAt,
            },
          }
        );

        return sendJson(res, 200, {
          order: {
            _id: String(order._id),
            items: order.items,
            total: order.total,
            status: "CHỜ GIAO HÀNG",
            paid: false,
            paymentMethod: method,
          },
        });
      }

      // Ở đây mô phỏng cổng thanh toán luôn thành công.
      // Khi gắn cổng thật (Stripe/MoMo/VNPay...), thay khối này bằng lời gọi cổng,
      // chỉ cập nhật đơn khi cổng trả về thành công.
      await db
        .collection("orders")
        .updateOne(
          { _id: orderId, userId: user.userId, paid: false },
          { $set: { paid: true, status: "ĐÃ THANH TOÁN", paymentMethod: method, paidAt } }
        );

      sendJson(res, 200, {
        order: {
          _id: String(order._id),
          items: order.items,
          total: order.total,
          status: "ĐÃ THANH TOÁN",
          paid: true,
          paymentMethod: method,
          methodLabel: methodMeta ? methodMeta.label : method,
          paidAt,
        },
      });
    },
    { auth: true }
  );

  // GET /api/payment-methods  (danh mục phương thức thanh toán, công khai)
  router.add(
    "GET",
    "/api/payment-methods",
    async ({ res }) => {
      sendJson(res, 200, { methods: PAYMENT_METHODS });
    }
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
