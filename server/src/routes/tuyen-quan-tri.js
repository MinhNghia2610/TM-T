// Các API của module quản trị: tất cả đều yêu cầu role "admin" (kiểm tra ở may-chu.js)
const { ObjectId } = require("mongodb");
const { getDb } = require("../co-so-du-lieu");
const { sendJson } = require("../lib/http");
const { categoryLabel } = require("../lib/danh-muc-san-pham");

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

      const ordersColl = db.collection("orders");

      // Đơn chưa thu được tiền (chưa thanh toán và chưa huỷ) — "công nợ"
      const [unpaidOrders, unpaidGroup] = await Promise.all([
        ordersColl.countDocuments({ paid: false, status: { $ne: "ĐÃ HUỶ" } }),
        ordersColl
          .aggregate([
            { $match: { paid: false, status: { $ne: "ĐÃ HUỶ" } } },
            { $group: { _id: null, value: { $sum: "$total" } } },
          ])
          .toArray(),
      ]);
      const unpaidValue = unpaidGroup[0]?.value || 0;

      // Số đơn theo từng trạng thái (để vẽ bảng phân bổ ở dashboard)
      const statusGroup = await ordersColl
        .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        .toArray();
      const statusCounts = {};
      for (const g of statusGroup) {
        statusCounts[g._id || "(không rõ)"] = g.count;
      }

      // Doanh thu 7 ngày: gom theo ngày rồi bơm đủ 7 ngày (kể cả ngày 0 đơn).
      // Nếu 7 ngày qua chưa có đơn đã thanh toán (dữ liệu cũ), khung được lùi về
      // ngày gần nhất có doanh thu để biểu đồ không bị rỗng vô ích.
      const now = new Date();
      let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastWeekStart = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() - 6);
      const hasRecentPaid = await ordersColl.countDocuments({
        paid: true,
        createdAt: { $gte: lastWeekStart },
      });
      if (!hasRecentPaid) {
        const latest = await ordersColl
          .find({ paid: true })
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();
        if (latest[0] && latest[0].createdAt) {
          const d = latest[0].createdAt;
          endDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        }
      }
      const since = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() - 6);
      const dayGroup = await ordersColl
        .aggregate([
          { $match: { paid: true, createdAt: { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "Asia/Ho_Chi_Minh",
                },
              },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 },
            },
          },
        ])
        .toArray();
      const dayMap = new Map(dayGroup.map((d) => [d._id, d]));
      // Ngày cuối của khung ("YYYY-MM-DD") để giao diện ghi rõ khoảng thời gian
      const revenue7dTo = `${endDay.getFullYear()}-${String(endDay.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(endDay.getDate()).padStart(2, "0")}`;
      const revenue7d = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        const hit = dayMap.get(key);
        revenue7d.push({ date: key, revenue: hit?.revenue || 0, orders: hit?.orders || 0 });
      }

      // Top 5 sản phẩm bán chạy theo số lượng, chỉ tính đơn đã thanh toán
      const topGroup = await ordersColl
        .aggregate([
          { $match: { paid: true } },
          { $unwind: "$items" },
          {
            $group: {
              // Gom theo tên: cùng một sản phẩm có thể xuất hiện với id cũ/mới,
              // còn tên thì luôn là thứ quản trị viên nhìn thấy
              _id: "$items.name",
              qty: { $sum: "$items.qty" },
              revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
            },
          },
          { $sort: { qty: -1, revenue: -1 } },
          { $limit: 5 },
        ])
        .toArray();
      const topProducts = topGroup.map((g) => ({
        name: g._id || "(đã xoá)",
        qty: g.qty,
        revenue: g.revenue,
      }));

      // Doanh thu theo danh mục (snapshot category lưu trong từng dòng đơn).
      // Đơn cũ chưa có category được gom vào "Khác" thay vì bị bỏ sót.
      const categoryGroup = await ordersColl
        .aggregate([
          { $match: { paid: true } },
          { $unwind: "$items" },
          {
            $group: {
              _id: { $ifNull: ["$items.category", "khac"] },
              qty: { $sum: "$items.qty" },
              revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
            },
          },
          { $sort: { revenue: -1 } },
        ])
        .toArray();
      const salesByCategory = categoryGroup.map((g) => ({
        slug: g._id,
        label: categoryLabel(g._id),
        qty: g.qty,
        revenue: g.revenue,
      }));

      // 6 đơn mới nhất để dashboard hiển thị ngay việc cần xử lý
      const recentRaw = await ordersColl
        .find({}, { projection: { items: { $slice: 3 }, userId: 1, total: 1, status: 1, paid: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      const recentUserIds = [...new Set(recentRaw.map((o) => String(o.userId)))]
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));
      const recentUsers = await db
        .collection("users")
        .find({ _id: { $in: recentUserIds } }, { projection: { name: 1 } })
        .toArray();
      const nameById = new Map(recentUsers.map((u) => [String(u._id), u.name]));
      const recentOrders = recentRaw.map((o) => ({
        _id: String(o._id),
        code: String(o._id).slice(-6).toUpperCase(),
        userName: nameById.get(String(o.userId)) || "(đã xoá)",
        total: o.total,
        status: o.status,
        paid: !!o.paid,
        createdAt: o.createdAt,
        itemNames: (o.items || []).map((i) => i.name),
      }));

      sendJson(res, 200, {
        stats: {
          totalProducts,
          totalUsers,
          totalOrders,
          paidOrders,
          revenue,
          unpaidOrders,
          unpaidValue,
          statusCounts,
          revenue7d,
          revenue7dTo,
          topProducts,
          salesByCategory,
          recentOrders,
        },
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
