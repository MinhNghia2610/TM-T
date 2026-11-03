# TMĐT — Mini E-commerce

Dự án e-commerce mini gồm 3 phần:

```
tmdt/
├── server/     # API Node.js thuần (module http) + MongoDB (driver mongodb)
├── web/        # Web ReactJS (Vite + React Router) — khách hàng + module quản trị
└── mobile/     # Ứng dụng React Native (Expo)
```

## Chức năng

**Khách hàng (web + mobile):** xem sản phẩm, tìm kiếm, chi tiết sản phẩm, giỏ hàng, đặt hàng, thanh toán, xem đơn hàng của mình, đăng ký / đăng nhập.

**Quản trị viên (web):** module quản trị riêng — tổng quan số liệu, thêm / sửa / xoá sản phẩm, quản lý đơn hàng (cập nhật trạng thái), quản lý người dùng (cấp / thu hồi quyền admin).

**Thanh toán:** 4 phương thức (danh mục chung ở `server/src/routes/payment-methods.js`):

| Mã | Phương thức | Ghi chú |
| -- | ----------- | ------- |
| `COD` | Thanh toán khi nhận hàng | Chưa chốt tiền, đơn chuyển sang "CHỜ GIAO HÀNG" |
| `CASH` | Tiền mặt | Mô phỏng: luôn thành công |
| `BANK_TRANSFER` | Chuyển khoản ngân hàng | Mô phỏng, có thông tin tài khoản nhận (VCB) |
| `CARD` | Thẻ (Visa/Master/NapAS) | Mô phỏng cổng thanh toán |

Gọi `POST /api/orders/:id/pay { method }` để trả tiền cho một đơn (chỉ chủ đơn, không thanh toán lặp — trả `409` nếu đơn đã trả). Khi gắn cổng thật (Stripe/MoMo/VNPay...), thay khối mô phỏng trong `order.routes.js` bằng lời gọi cổng.

## Yêu cầu

- Node.js 22+
- MongoDB đang chạy ở `localhost:27017` (cài local hoặc dùng MongoDB Atlas)

## 1. Chạy server

```bash
cd server
cp .env.example .env      # sửa TOKEN_SECRET thành chuỗi ngẫu nhiên của bạn
npm install
npm run seed              # xoá + chèn 20 sản phẩm mẫu và 4 tài khoản demo
npm start                 # chạy tại http://localhost:3000
```

## 2. Chạy web

```bash
cd web
npm install
npm run dev               # mở http://localhost:5173
```

Web gọi `/api/*` và Vite tự chuyển tiếp sang `http://localhost:3000` (xem `vite.config.js`).
Các lệnh khác: `npm run build` (build production vào `dist/`), `npm run lint` (oxlint).

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

## Tài khoản demo (tạo bởi `npm run seed`)

| Email | Mật khẩu | Quyền |
| ----- | -------- | ----- |
| `admin@tmdt.vn` | `admin123` | `admin` — vào module quản trị |
| `thanh@tmdt.vn` | `thanh123` | `user` (khách hàng) |
| `minh@tmdt.vn`  | `minh123`  | `user` (khách hàng) |
| `lan@tmdt.vn`   | `lan123`   | `user` (khách hàng) |

Đây là **danh sách quyền gốc chuẩn** của hệ thống: chỉ `admin@tmdt.vn` là admin, các tài khoản còn lại đều là khách hàng. Đổi quyền sau đó bằng trang "Người dùng" của module quản trị.

## Module quản trị (web)

Web có **module quản trị riêng** tại `http://localhost:5173/admin`, tách bạch hoàn toàn khỏi giao diện khách hàng (khung riêng, thanh điều hướng riêng; chỉ hiện link "Quản trị" trên navbar cho tài khoản `role: "admin"`).

| Trang | Đường dẫn | Chức năng |
| ----- | --------- | --------- |
| Tổng quan  | `/admin`         | Số liệu: sản phẩm, người dùng, đơn hàng, doanh thu (đơn đã thanh toán) |
| Sản phẩm   | `/admin/products`| Thêm / sửa / xoá sản phẩm |
| Đơn hàng   | `/admin/orders`  | Xem tất cả đơn của mọi người, cập nhật trạng thái (MỚI → ĐANG GIAO HÀNG → HOÀN THÀNH / ĐÃ HUỶ...) |
| Người dùng | `/admin/users`   | Danh sách tài khoản, cấp / thu hồi quyền admin (không thể tự đổi quyền của mình) |

- Guard nằm ở `web/src/admin/khung-quan-tri.jsx`: người không phải admin sẽ bị đưa về trang chủ; server cũng kiểm tra lại role trong token (mọi route `/api/admin/*` trả `401` nếu chưa đăng nhập, `403` nếu không phải admin — kiểm tra hai lớp).
- Server các API trả 404 khi không tìm thấy đối tượng, 400 khi trạng thái / quyền / dữ liệu không hợp lệ.
- Role nằm trong token nên sau khi thay đổi quyền, người dùng đó cần **đăng nhập lại**.

## API chính

| Method | Đường dẫn            | Mô tả                          | Quyền yêu cầu |
| ------ | -------------------- | ------------------------------ | ------------- |
| POST   | `/api/auth/register` | Đăng ký `{name,email,password}`| Không         |
| POST   | `/api/auth/login`    | Đăng nhập `{email,password}`   | Không         |
| GET    | `/api/products`      | Danh sách sản phẩm (`?search=`)| Không         |
| GET    | `/api/products/:id`  | Chi tiết sản phẩm              | Không         |
| GET    | `/api/orders/:id`    | Lấy 1 đơn của mình (cho trang thanh toán) | Đăng nhập |
| POST   | `/api/orders`        | Đặt hàng `{items:[{productId,qty}]}` | Đăng nhập |
| GET    | `/api/orders`        | Đơn hàng của tôi               | Đăng nhập     |
| POST   | `/api/orders/:id/pay`| Thanh toán `{method: "COD"|"CASH"|"BANK_TRANSFER"|"CARD"}` | Đăng nhập |
| GET    | `/api/payment-methods`| Danh mục phương thức thanh toán | Không       |
| GET    | `/api/admin/stats`   | Số liệu tổng quan              | Admin         |
| GET    | `/api/admin/orders`  | Tất cả đơn hàng (kèm người mua)| Admin         |
| PUT    | `/api/admin/orders/:id/status` | Cập nhật trạng thái đơn | Admin    |
| GET    | `/api/admin/users`   | Danh sách người dùng           | Admin         |
| PUT    | `/api/admin/users/:id/role` | Gán / thu hồi quyền admin | Admin      |
| POST   | `/api/products`      | Thêm sản phẩm (validate giá, URL ảnh) | Admin |
| PUT    | `/api/products/:id`  | Sửa sản phẩm                   | Admin         |
| DELETE | `/api/products/:id`  | Xoá sản phẩm                   | Admin         |

Dữ liệu trả về: giá sản phẩm luôn lấy từ DB khi đặt hàng (không tin client); đơn của riêng mình (lọc theo `userId`); route `/api/orders/:id` chỉ chủ đơn xem được.

## Cấu trúc thư mục

```
server/
├── package.json            # chỉ 1 dependency: mongodb
├── .env / .env.example     # PORT, MONGODB_URI, DB_NAME, TOKEN_SECRET
└── src/
    ├── may-chu.js          # entry: http server, CORS, đọc body JSON, guard token (auth/admin), điều hướng route
    ├── cau-hinh.js         # đọc .env (nạp bằng --env-file)
    ├── co-so-du-lieu.js    # kết nối MongoDB
    ├── du-lieu-mau.js      # seed 20 sản phẩm + 4 tài khoản demo (scrypt đã băm mật khẩu)
    ├── lib/                          # hàm tiện ích (giữ tên kỹ thuật):
    │   ├── http.js                   # sendJson, readBody
    │   ├── router.js                 # router mini (hỗ trợ :param)
    │   └── auth.js                   # hash mật khẩu (scrypt + timingSafeEqual) + token HMAC-SHA256 (đính role, hết hạn 7 ngày)
    └── routes/                       # các tuyến API qua tiếng Việt:
        ├── tuyen-xac-thuc.js         # đăng ký / đăng nhập
        ├── tuyen-san-pham.js         # GET công khai + POST/PUT/DELETE cho admin
        ├── danh-muc-thanh-toan.js    # danh mục 4 phương thức (dùng chung server + client)
        ├── tuyen-don-hang.js         # đặt hàng, đơn của tôi, thanh toán, danh mục phương thức
        └── tuyen-quan-tri.js         # stats, tất cả đơn, cập nhật trạng thái, danh sách người dùng, cấp quyền

web/
├── vite.config.js          # proxy /api/* -> localhost:3000
└── src/
    ├── diem-vao.jsx        # entry: BrowserRouter + providers (được index.html nạp)
    ├── Ung-dung.jsx        # định tuyến: trang khách + module quản trị /admin/*
    ├── api.js              # hàm gọi API (tự gắn Bearer token) + formatVND
    ├── xac-thuc.jsx        # AuthContext (lưu user + token ở localStorage)
    ├── gio-hang.jsx        # CartContext (giỏ hàng ở localStorage)
    ├── components/
    │   └── thanh-dieu-huong.jsx  # navbar khách hàng (hiện "Quản trị" nếu là admin)
    ├── pages/              # trang khách
    │   ├── trang-san-pham.jsx              trang-chi-tiet-san-pham.jsx
    │   ├── trang-gio-hang.jsx              trang-don-hang.jsx
    │   ├── trang-thanh-toan.jsx            # chọn phương thức + trả tiền cho 1 đơn
    │   └── trang-dang-nhap.jsx
    └── admin/              # MODULE QUẢN TRỊ (riêng biệt)
        ├── khung-quan-tri.jsx       # khung + guard chỉ admin được vào
        ├── trang-tong-quan.jsx      # /admin          — tổng quan số liệu
        ├── quan-ly-san-pham.jsx     # /admin/products — thêm / sửa / xoá
        ├── quan-ly-don-hang.jsx     # /admin/orders   — mọi đơn + đổi trạng thái
        └── quan-ly-nguoi-dung.jsx   # /admin/users    — cấp / thu hồi quyền

mobile/
├── Ung-dung.js             # điều hướng tab bằng state (không dùng navigation library)
└── src/
    ├── api.js              # hàm gọi API + BASE_URL (giữ tên kỹ thuật)
    ├── luu-tru.js          # StoreContext (đăng nhập + giỏ hàng, AsyncStorage)
    └── screens/            # man-hinh-san-pham, chi-tiet-san-pham, gio-hang, don-hang, thanh-toan, dang-nhap
```

## Ghi chú bảo mật

- CORS hiện mở `*` (tiện khi dev web + mobile); khi deploy nên giới hạn lại nguồn gọi.
- Mặc định `TOKEN_SECRET = "dev-secret"` — **phải** đổi trong `.env` khi chạy thật.
- Token tự ký bằng HMAC-SHA256 (không phải JWT chuẩn) đủ dùng cho demo; nếu mở rộng, cân nhắc dùng thư viện JWT.
- Route quản trị kiểm tra bảo mật **hai lần**: UI (khung-quan-tri.jsx) và server (role trong token) — UI guard không phải lớp bảo vệ duy nhất.
