// Router cực nhỏ: lưu danh sách route, so khớp method + path (hỗ trợ :param)

function createRouter() {
  const routes = [];

  return {
    // opts: { auth: true } -> route cần đăng nhập
    add(method, path, handler, opts = {}) {
      const keys = [];
      const pattern = new RegExp(
        "^" +
          path.replace(/:[^/]+/g, (m) => {
            keys.push(m.slice(1));
            return "([^/]+)";
          }) +
          "$"
      );
      routes.push({ method, pattern, keys, handler, opts });
    },

    match(method, pathname) {
      for (const r of routes) {
        const m = r.pattern.exec(pathname);
        if (m && r.method === method) {
          // decodeURIComponent ném URIError với path sai cú pháp (vd "/api/x/%ZZ").
          // Phải bắt tại đây — nằm ngoài try/catch của may-chu.js — nếu không
          // 1 request hỏng sẽ sập cả server.
          try {
            const params = {};
            r.keys.forEach((k, i) => {
              params[k] = decodeURIComponent(m[i + 1]);
            });
            return { handler: r.handler, opts: r.opts, params };
          } catch {
            return null; // coi như không tìm thấy -> gửi 404 cho client
          }
        }
      }
      return null;
    },
  };
}

module.exports = { createRouter };
