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

## API chính

| Method | Đường dẫn           | Mô tả                        | Cần đăng nhập |
| ------ | ------------------- | ---------------------------- | ------------- |
| POST   | `/api/auth/register` | Đăng ký `{name,email,password}` | Không      |
| POST   | `/api/auth/login`    | Đăng nhập `{email,password}` | Không         |
| GET    | `/api/products`      | Danh sách sản phẩm (`?search=`) | Không      |
| GET    | `/api/products/:id`  | Chi tiết sản phẩm            | Không         |
| POST   | `/api/orders`        | Đặt hàng `{items:[{productId,qty}]}` | Có    |
| GET    | `/api/orders`        | Đơn hàng của tôi             | Có            |

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
