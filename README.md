# TMĐT — Mini E-commerce

Dự án rất cơ bản gồm 3 phần:

```
tmdt/
├── server/     # API Node.js thuần (module http) + MongoDB (driver mongodb)
├── web/        # Web ReactJS (Vite + React Router)
└── mobile/     # Ứng dụng React Native (Expo)
```

Chức năng: xem sản phẩm, tìm kiếm, giỏ hàng, đặt hàng, đăng ký / đăng nhập (token tự ký bằng HMAC).

## Yêu cầu

- Node.js 22+
- MongoDB đang chạy ở `localhost:27017` (cài local hoặc dùng MongoDB Atlas)

## 1. Chạy server

```bash
cd server
cp .env.example .env      # sửa TOKEN_SECRET thành chuỗi ngẫu nhiên của bạn
npm install
npm run seed              # chèn 6 sản phẩm mẫu
npm start                 # chạy tại http://localhost:3000
```

## 2. Chạy web

```bash
cd web
npm install
npm run dev               # mở http://localhost:5173
```

Web gọi `/api/*` và Vite tự chuyển tiếp sang `http://localhost:3000` (xem `vite.config.js`).

## 3. Chạy mobile (Expo)

```bash
cd mobile
npm install
npx expo start            # quét mã QR bằng app Expo Go
```

Trước khi chạy, sửa `BASE_URL` trong `mobile/src/api.js`:

| Môi trường                  | Giá trị BASE_URL                  |
| --------------------------- | --------------------------------- |
| Máy ảo Android              | `http://10.0.2.2:3000/api`        |
| Máy ảo iOS / web trong Expo | `http://localhost:3000/api`       |
| Điện thoại thật (Expo Go)   | `http://<IP-máy-tính>:3000/api`   |

## Giao diện quản trị (web)

Web có **module quản trị riêng** tại `http://localhost:5173/admin`, tách bạch hoàn toàn khỏi giao diện khách hàng (khung riêng, thanh điều hướng riêng, chỉ hiện link “Quản trị” trên navbar cho tài khoản `role: "admin"` — seed sẵn `admin@tmdt.vn / admin123`).

| Trang | Đường dẫn | Chức năng |
| ----- | --------- | --------- |
| Tổng quan   | `/admin`          | Số liệu: sản phẩm, người dùng, đơn hàng, doanh thu (đơn đã thanh toán) |
| Sản phẩm    | `/admin/products` | Thêm / sửa / xoá sản phẩm |
| Đơn hàng    | `/admin/orders`   | Xem tất cả đơn của mọi người, cập nhật trạng thái (MỚI → ĐANG GIAO HÀNG → HOÀN THÀNH / ĐÃ HUỶ...) |
| Người dùng  | `/admin/users`    | Danh sách tài khoản, cấp / thu hồi quyền admin (không thể tự đổi quyền của mình) |

- Guard nằm ở `web/src/admin/AdminLayout.jsx`: người không phải admin sẽ bị đưa về trang chủ; server cũng kiểm tra lại role trong token (mọi route `/api/admin/*` trả `401` nếu chưa đăng nhập, `403` nếu không phải admin — kiểm tra hai lớp).
- Server các API trả 404 khi không tìm thấy đối tượng, 400 khi trạng thái / quyền không hợp lệ.

## API chính

| Method | Đường dẫn           | Mô tả                        | Cần đăng nhập |
| ------ | ------------------- | ---------------------------- | ------------- |
| POST   | `/api/auth/register` | Đăng ký `{name,email,password}` | Không      |
| POST   | `/api/auth/login`    | Đăng nhập `{email,password}` | Không         |
| GET    | `/api/products`      | Danh sách sản phẩm (`?search=`) | Không      |
| GET    | `/api/products/:id`  | Chi tiết sản phẩm            | Không         |
| POST   | `/api/orders`        | Đặt hàng `{items:[{productId,qty}]}` | Có    |
| GET    | `/api/orders`        | Đơn hàng của tôi             | Có            |
| GET    | `/api/admin/stats`   | Số liệu tổng quan            | Admin         |
| GET    | `/api/admin/orders`  | Tất cả đơn hàng              | Admin         |
| PUT    | `/api/admin/orders/:id/status` | Cập nhật trạng thái đơn | Admin     |
| GET    | `/api/admin/users`   | Danh sách người dùng         | Admin         |
| PUT    | `/api/admin/users/:id/role`    | Gán / thu hồi quyền admin | Admin    |
| POST   | `/api/products`      | Thêm sản phẩm                | Admin         |
| PUT    | `/api/products/:id`  | Sửa sản phẩm                 | Admin         |
| DELETE | `/api/products/:id`  | Xoá sản phẩm                 | Admin         |

## Cấu trúc thư mục

```
server/
├── src/
│   ├── server.js            # entry: tạo http server, CORS, điều hướng, kiểm tra token
│   ├── config.js            # đọc .env
│   ├── db.js                # kết nối MongoDB
│   ├── seed.js              # dữ liệu sản phẩm mẫu
│   ├── lib/
│   │   ├── http.js          # sendJson, readBody
│   │   ├── router.js        # router mini (hỗ trợ :param)
│   │   └── auth.js          # hash mật khẩu (scrypt) + token HMAC
│   └── routes/
│       ├── auth.routes.js
│       ├── product.routes.js
│       └── order.routes.js

web/
└── src/
    ├── main.jsx             # entry: BrowserRouter + providers
    ├── App.jsx              # định tuyến các trang
    ├── api.js               # hàm gọi API
    ├── auth.jsx             # AuthContext (đăng nhập)
    ├── cart.jsx             # CartContext (giỏ hàng ở localStorage)
    ├── components/Navbar.jsx
    └── pages/               # Products, ProductDetail, Cart, Orders, Login

mobile/
├── App.js                   # điều hướng tab bằng state
└── src/
    ├── api.js               # hàm gọi API + BASE_URL
    ├── store.js             # StoreContext (đăng nhập + giỏ hàng, AsyncStorage)
    └── screens/             # Products, ProductDetail, Cart, Orders, Login
```
