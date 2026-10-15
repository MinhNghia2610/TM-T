// Các API của module quản trị: tất cả đều yêu cầu role "admin" (kiểm tra ở server.js)
const { ObjectId } = require("mongodb");
const { getDb } = require("../db");
const { sendJson } = require("../lib/http");

// Trạng thái đơn hàng mà quản trị viên được gán (hiển thị trùng khớp ở web)
const ADMIN_ORDER_STATUSES = [
  "MỚI",
  "CHỜ GIAO HÀNG",
  "ĐÃ THANH TOÁN",
  "ĐANG GIAO HÀNG",
  "HOÀN THÀNH",
  "ĐÃ HUỶ",
];

const USER_ROLES = ["user", "admin"];

module.exports.registerAdminRoutes = function registerAdminRoutes(router) {
  // GET /api/admin/stats  — số liệu tổng quan cho dashboard
  router.add(
    "GET",
    "/api/admin/stats",
    async ({ res }) => {
      const db = getDb();
      const [totalProducts, totalUsers, totalOrders] = await Promise.all([
        db.collection("products").countDocuments(),
        db.collection("users").countDocuments(),
        db.collection("orders").countDocuments(),
      ]);

      // Doanh thu: chỉ tính các đơn đã thanh toán
      const revenueGroup = await db
        .collection("orders")
        .aggregate([
          { $match: { paid: true } },
          { $group: { _id: null, revenue: { $sum: "$total" }, paidOrders: { $sum: 1 } } },
        ])
        .toArray();
      const revenue = revenueGroup[0]?.revenue || 0;
      const paidOrders = revenueGroup[0]?.paidOrders || 0;

      sendJson(res, 200, {
        stats: { totalProducts, totalUsers, totalOrders, paidOrders, revenue },
      });
    },
    { admin: true }
  );

  // GET /api/admin/orders  — tất cả đơn hàng, kèm tên/email người mua
  router.add(
    "GET",
    "/api/admin/orders",
    async ({ res }) => {
      const db = getDb();
      const orders = await db
        .collection("orders")
        .find({})
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray();

      // Gắn thông tin người mua (orders lưu userId dạng string)
      const userIds = [...new Set(orders.map((o) => String(o.userId)))];
      const users = await db
        .collection("users")
        .find(
          { _id: { $in: userIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id)) } },
          { projection: { passwordHash: 0 } }
        )
        .toArray();
      const userById = new Map(users.map((u) => [String(u._id), u]));

      const result = orders.map((o) => {
        const u = userById.get(String(o.userId));
        return {
          ...o,
          _id: String(o._id),
          user: u ? { name: u.name, email: u.email } : { name: "(đã xoá)", email: "" },
        };
      });

      sendJson(res, 200, { orders: result });
    },
    { admin: true }
  );

  // PUT /api/admin/orders/:id/status  { status }  — quản trị viên cập nhật trạng thái
  router.add(
    "PUT",
    "/api/admin/orders/:id/status",
    async ({ res, params, body }) => {
      const status = String((body && body.status) || "");
      if (!ADMIN_ORDER_STATUSES.includes(status)) {
        return sendJson(res, 400, {
          message: `Trạng thái không hợp lệ (hỗ trợ: ${ADMIN_ORDER_STATUSES.join(", ")})`,
        });
      }

      let orderId;
      try {
        orderId = new ObjectId(params.id);
      } catch {
        return sendJson(res, 400, { message: "Id đơn hàng không hợp lệ" });
      }

      const order = await getDb()
        .collection("orders")
        .findOneAndUpdate({ _id: orderId }, { $set: { status } }, { returnDocument: "after" });
      if (!order) {
        return sendJson(res, 404, { message: "Không tìm thấy đơn hàng" });
      }

      sendJson(res, 200, { order: { ...order, _id: String(order._id) } });
    },
    { admin: true }
  );

  // GET /api/admin/users  — danh sách người dùng (không trả mật khẩu)
  router.add(
    "GET",
    "/api/admin/users",
    async ({ res }) => {
      const users = await getDb()
        .collection("users")
        .find({}, { projection: { passwordHash: 0 } })
        .sort({ createdAt: 1 })
        .toArray();

      sendJson(res, 200, { users: users.map((u) => ({ ...u, _id: String(u._id) })) });
    },
    { admin: true }
  );

  // PUT /api/admin/users/:id/role  { role: "user" | "admin" }  — gán/thu hồi quyền
  router.add(
    "PUT",
    "/api/admin/users/:id/role",
    async ({ res, params, body, user }) => {
      const role = String((body && body.role) || "");
      if (!USER_ROLES.includes(role)) {
        return sendJson(res, 400, {
          message: `Quyền không hợp lệ (hỗ trợ: ${USER_ROLES.join(", ")})`,
        });
      }

      let userId;
      try {
        userId = new ObjectId(params.id);
      } catch {
        return sendJson(res, 400, { message: "Id người dùng không hợp lệ" });
      }

      // Không cho quản trị viên tự hạ quyền chính mình
      if (String(user.userId) === params.id) {
        return sendJson(res, 400, { message: "Không thể tự thay đổi quyền của chính mình" });
      }

      const updated = await getDb()
        .collection("users")
        .findOneAndUpdate(
          { _id: userId },
          { $set: { role } },
          { returnDocument: "after", projection: { passwordHash: 0 } }
        );
      if (!updated) {
        return sendJson(res, 404, { message: "Không tìm thấy người dùng" });
      }

      sendJson(res, 200, { user: { ...updated, _id: String(updated._id) } });
    },
    { admin: true }
  );
};
