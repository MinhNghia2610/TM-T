const crypto = require("crypto");

// ---- Mật khẩu: hash bằng scrypt (có sẵn trong Node, không cần thư viện) ----

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
}

// ---- Token: tự ký HMAC-SHA256, dạng base64url(payload).base64url(chữ ký) ----

const TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

function signToken(payload, secret) {
  const data = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + TOKEN_EXPIRES_MS })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token, secret) {
  try {
    const [data, sig] = String(token).split(".");
    if (!data || !sig) return null;
    const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
