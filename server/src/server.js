const http = require("http");
const { connect } = require("./db");
const { getDb } = require("./db");
const { createRouter } = require("./lib/router");
const { sendJson, readBody } = require("./lib/http");
const { verifyToken } = require("./lib/auth");
const config = require("./config");

const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");

const router = createRouter();
authRoutes.register(router);
productRoutes.register(router);
productRoutes.registerAdmin(router);
orderRoutes.register(router);
adminRoutes.registerAdminRoutes(router);

const server = http.createServer(async (req, res) => {
  // CORS đơn giản: cho phép mọi nguồn gọi (dùng cho web + mobile khi dev)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const match = router.match(req.method, url.pathname);

  if (!match) {
    return sendJson(res, 404, { message: "Không tìm thấy đường dẫn" });
  }

  try {
    // Chỉ đọc body với các method có body; JSON sai -> trả 400
    let body;
    if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "PATCH"
    ) {
      const parsed = await readBody(req);
      if (parsed === null) {
        return sendJson(res, 400, { message: "Body phải là JSON hợp lệ" });
      }
      body = parsed;
    }

    // Nếu route yêu cầu đăng nhập -> kiểm tra header Authorization: Bearer <token>
    // opts.admin = true -> ngoài việc đăng nhập, user phải có role "admin"
    let user = null;
    if (match.opts.auth || match.opts.admin) {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : "";
      const payload = token ? verifyToken(token, config.tokenSecret) : null;
      if (!payload) {
        return sendJson(res, 401, { message: "Bạn cần đăng nhập" });
      }
      if (match.opts.admin && payload.role !== "admin") {
        return sendJson(res, 403, { message: "Chỉ quản trị viên mới có quyền này" });
      }
      user = payload;
    }

    await match.handler({ req, res, params: match.params, query: url.searchParams, body, user });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { message: "Lỗi server" });
  }
});

async function main() {
  await connect(config.mongoUri, config.dbName);

  // Index email duy nhất để không đăng ký trùng
  await getDb().collection("users").createIndex({ email: 1 }, { unique: true });

  server.listen(config.port, () => {
    console.log(`Server đang chạy tại http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error("Không khởi động được server:", err.message);
  process.exit(1);
});
