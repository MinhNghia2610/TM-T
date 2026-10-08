const { getDb } = require("../db");
const { sendJson } = require("../lib/http");
const { hashPassword, verifyPassword, signToken } = require("../lib/auth");
const { tokenSecret } = require("../config");

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role || "user" };
}

module.exports.register = function register(router) {
  // POST /api/auth/register  { name, email, password }
  router.add("POST", "/api/auth/register", async ({ res, body }) => {
    const { name, email, password } = body || {};
    if (!name || !email || !password) {
      return sendJson(res, 400, { message: "Thiếu name, email hoặc password" });
    }
    if (!EMAIL_RE.test(email)) {
      return sendJson(res, 400, { message: "Email không hợp lệ" });
    }
    if (String(password).length < 6) {
      return sendJson(res, 400, { message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const users = getDb().collection("users");
    const normalizedEmail = String(email).toLowerCase();

    const exists = await users.findOne({ email: normalizedEmail });
    if (exists) {
      return sendJson(res, 409, { message: "Email đã được đăng ký" });
    }

    const result = await users.insertOne({
      name,
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      createdAt: new Date(),
    });

    const user = { _id: result.insertedId, name, email: normalizedEmail };
    sendJson(res, 201, {
      token: signToken({ userId: String(user._id) }, tokenSecret),
      user: publicUser(user),
    });
  });

  // POST /api/auth/login  { email, password }
  router.add("POST", "/api/auth/login", async ({ res, body }) => {
    const { email, password } = body || {};
    if (!email || !password) {
      return sendJson(res, 400, { message: "Thiếu email hoặc password" });
    }

    const user = await getDb()
      .collection("users")
      .findOne({ email: String(email).toLowerCase() });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendJson(res, 401, { message: "Email hoặc mật khẩu không đúng" });
    }

    sendJson(res, 200, {
      token: signToken({ userId: String(user._id) }, tokenSecret),
      user: publicUser(user),
    });
  });
};
