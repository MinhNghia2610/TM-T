// Chèn dữ liệu mẫu:  npm run seed
// 20 sản phẩm gadget (ảnh thật, đã kiểm tra URL trả về 200) + 4 tài khoản demo.
const { connect, getDb } = require("./db");
const { hashPassword } = require("./lib/auth");
const config = require("./config");

// Unsplash: ảnh chủ đề công nghệ (bỏ ?w= sẽ nhận bản gốc)
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

const products = [
  {
    name: "Tai nghe Bluetooth chống ồn",
    price: 1290000,
    description: "Tai nghe không dây, chống ồn chủ động, pin 30 giờ, kèm hộp sạc nhanh Type-C.",
    image: img("photo-1505740420928-5e560c06d30e"),
    createdAt: new Date(),
  },
  {
    name: "Đồng hồ thông minh Series 8",
    price: 2490000,
    description: "Màn hình AMOLED, đo nhịp tim và SpO2, chống nước 5ATM, pin 7 ngày.",
    image: img("photo-1523275335684-37898b6baf30"),
    createdAt: new Date(),
  },
  {
    name: "Loa bluetooth mini",
    price: 590000,
    description: "Loa di động chống nước IPX7, âm bass mạnh, phát nhạc liên tục 12 giờ.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Sonos_PLAY_1_wireless_speaker.jpg",
    createdAt: new Date(),
  },
  {
    name: "Sạc dự phòng 20.000mAh",
    price: 450000,
    description: "Sạc nhanh 22.5W, 2 cổng USB-A + 1 cổng Type-C, màn hình LED hiển thị pin.",
    image: img("photo-1585790050230-5dd28404ccb9"),
    createdAt: new Date(),
  },
  {
    name: "Chuột không dây êm ái",
    price: 320000,
    description: "Kết nối 2.4GHz + Bluetooth, 4 nút bấm, pin dùng tới 18 tháng, chuyển động mượt 4000 DPI.",
    image: img("photo-1527814050087-3793815479db"),
    createdAt: new Date(),
  },
  {
    name: "Bàn phím cơ không dây",
    price: 990000,
    description: "Switch Red êm ái, kết nối 3 chế độ, keycap PBT chống bám dầu, LED rainbow.",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/94/Ergonomic_Keyboard_on_Monitor_With_Radius_Tree.jpg",
    createdAt: new Date(),
  },
  {
    name: "Camera IP wifi trong nhà",
    price: 690000,
    description: "Quan sát 2K, quay quét 360°, đàm thoại 2 chiều, xem qua điện thoại, hồng ngoại ban đêm.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/11/Camera_IP.JPG",
    createdAt: new Date(),
  },
  {
    name: "Ốp lưng sạc không dây MagSafe",
    price: 420000,
    description: "Ốp lưng phủ silicone chống sốc, sạc không dây từ tính 15W cho iPhone 12 trở lên.",
    image: img("photo-1524678714210-9917a6c619c2"),
    createdAt: new Date(),
  },
  {
    name: "Cân điện tử nhà bếp",
    price: 250000,
    description: "Cân điện tử bếp tối đa 5kg, chia độ chính xác 1gam, màn hình LCD, mặt kính cường lực dễ lau chùi.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Escali_digital_kitchen_scale.jpg",
    createdAt: new Date(),
  },
  {
    name: "Máy lọc không khí mini",
    price: 1590000,
    description: "Lọc bụi mịn PM2.5 với màng HEPA, đèn thông báo chất lượng không khí, hoạt động êm ái 28dB.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Air_Purifier_%28Levoit_LV-H133%29_%2849317867758%29.jpg/960px-Air_Purifier_%28Levoit_LV-H133%29_%2849317867758%29.jpg",
    createdAt: new Date(),
  },
  {
    name: "Hub USB-C 8 trong 1",
    price: 780000,
    description: "HDMI 4K@60Hz, 3 cổng USB 3.0, 2 cổng Type-C, đọc thẻ SD/microSD, sạc qua PD 100W.",
    image: img("photo-1550009158-9ebf69173e03"),
    createdAt: new Date(),
  },
  {
    name: "Tay cầm chơi game Bluetooth",
    price: 560000,
    description: "Tương thích iOS/Android/PC, rung phản hồi, kích tay bóp nhạy, pin 15 giờ.",
    image: img("photo-1587825140708-dfaf72ae4b04"),
    createdAt: new Date(),
  },
  {
    name: "Đèn bàn thông minh cảm ứng",
    price: 480000,
    description: "Chỉnh 3 chế độ sáng, cảm ứng trượt, cổng sạc USB tích hợp, thiết kế gập 180°.",
    image: img("photo-1507473885765-e6ed057f782c"),
    createdAt: new Date(),
  },
  {
    name: "Điện thoại thông minh 5G",
    price: 7490000,
    description: "Màn hình AMOLED 120Hz, camera chính 50MP, pin 5000mAh sạc nhanh 33W, hỗ trợ hai SIM.",
    image: img("photo-1511707171634-5f897ff02aa9"),
    createdAt: new Date(),
  },
  {
    name: "Laptop mỏng nhẹ 14 inch",
    price: 15490000,
    description: "CPU mới nhất, RAM 16GB, SSD 512GB, màn hình 14 inch độ phân giải 2.2K, nặng chỉ 1.3kg.",
    image: img("photo-1496181133206-80ce9b88a853"),
    createdAt: new Date(),
  },
  {
    name: "Tivi LED Full HD 24 inch",
    price: 2190000,
    description: "Màn hình 24 inch Full HD, ứng dụng Smart TV, loa stereo, 2 cổng HDMI 1 cổng USB.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/28/Sony_Bravia_24_Inch_LED_TV_Model_W60.jpg",
    createdAt: new Date(),
  },
  {
    name: "Máy chiếu văn phòng",
    price: 2790000,
    description: "Độ sáng 4200 lumen, độ tương phản 30000:1, cổng HDMI/VGA, phù hợp phòng họp vừa và nhỏ.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/14/InFocus_IN34.jpg",
    createdAt: new Date(),
  },
  {
    name: "Webcam Full HD họp trực tuyến",
    price: 490000,
    description: "Quay 1080p 30fps, micro khử ồn, chống ngược sáng, gắn trên màn hình hoặc đặt bàn.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/79/Webcam_%28Logitech_c922%29.jpg",
    createdAt: new Date(),
  },
  {
    name: "Máy bay camera 4K",
    price: 8990000,
    description: "Flycam gập gọn, camera 4K chống rung 3 trục, bay 30 phút, điều khiển tầm xa 5km.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/33/DJI_Mavic_2_Pro_with_Hasselblad_Camera_and_DJI_Mavic_Pro.jpg",
    createdAt: new Date(),
  },
  {
    name: "Máy pha cà phê vị Espresso",
    price: 1890000,
    description: "Dùng viên nén, áp suất 19 bar, nước nóng nhanh 25 giây, khay chứa nước 1 lít.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Machine_Nespresso_professionnelle_-10.JPG/960px-Machine_Nespresso_professionnelle_-10.JPG",
    createdAt: new Date(),
  },
];

// Tài khoản demo (mật khẩu được băm scrypt bằng cùng hàm với server)
const users = [
  {
    name: "Quản trị viên",
    email: "admin@tmdt.vn",
    passwordHash: hashPassword("admin123"),
    role: "admin",
    createdAt: new Date(),
  },
  {
    name: "Thành Test",
    email: "thanh@tmdt.vn",
    passwordHash: hashPassword("thanh123"),
    role: "user",
    createdAt: new Date(),
  },
  {
    name: "Minh Demo",
    email: "minh@tmdt.vn",
    passwordHash: hashPassword("minh123"),
    role: "user",
    createdAt: new Date(),
  },
  {
    name: "Lan Demo",
    email: "lan@tmdt.vn",
    passwordHash: hashPassword("lan123"),
    role: "user",
    createdAt: new Date(),
  },
];

async function main() {
  await connect(config.mongoUri, config.dbName);
  const db = getDb();

  const productCollection = db.collection("products");
  await productCollection.deleteMany({});
  await productCollection.insertMany(products);

  const userCollection = db.collection("users");
  await userCollection.deleteMany({});
  await userCollection.insertMany(users);

  console.log(`Đã seed ${products.length} sản phẩm (collection "products") và ${users.length} tài khoản (collection "users").`);
  console.log("Tài khoản demo:");
  console.log("  admin@tmdt.vn / admin123  (role: admin)");
  console.log("  thanh@tmdt.vn / thanh123, minh@tmdt.vn / minh123, lan@tmdt.vn / lan123  (role: user)");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed thất bại:", err.message);
  process.exit(1);
});
