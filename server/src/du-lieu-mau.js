// Chèn dữ liệu mẫu:  npm run seed
// 70 sản phẩm có danh mục (20 gadget + 50 sản phẩm bổ sung, ảnh thật đã kiểm tra URL trả về 200)
// + 54 tài khoản (4 tài khoản demo + 50 khách hàng)
// + 60 đơn hàng mẫu trải trong 45 ngày gần nhất.
// Script chạy theo kiểu upsert (khoá là tên sản phẩm / email) nên chạy lại không
// xoá đơn hàng thật hay dữ liệu đã có, chỉ thêm bản ghi còn thiếu. Riêng đơn mẫu
// được gắn cờ seedDemo và thay mới mỗi lần chạy để không bị nhân đôi.
const { connect, getDb } = require("./co-so-du-lieu");
const { hashPassword } = require("./lib/auth");
const { CATEGORIES } = require("./lib/danh-muc-san-pham");
const config = require("./cau-hinh");

// Unsplash: ảnh chủ đề công nghệ (bỏ ?w= sẽ nhận bản gốc)
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

const products = [
  {
    name: "Tai nghe Bluetooth chống ồn",
    category: "am-thanh",
    price: 1290000,
    description: "Tai nghe không dây, chống ồn chủ động, pin 30 giờ, kèm hộp sạc nhanh Type-C.",
    image: img("photo-1505740420928-5e560c06d30e"),
    createdAt: new Date(),
  },
  {
    name: "Đồng hồ thông minh Series 8",
    category: "dong-ho",
    price: 2490000,
    description: "Màn hình AMOLED, đo nhịp tim và SpO2, chống nước 5ATM, pin 7 ngày.",
    image: img("photo-1523275335684-37898b6baf30"),
    createdAt: new Date(),
  },
  {
    name: "Loa bluetooth mini",
    category: "am-thanh",
    price: 590000,
    description: "Loa di động chống nước IPX7, âm bass mạnh, phát nhạc liên tục 12 giờ.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Sonos_PLAY_1_wireless_speaker.jpg",
    createdAt: new Date(),
  },
  {
    name: "Sạc dự phòng 20.000mAh",
    category: "thiet-bi-so",
    price: 450000,
    description: "Sạc nhanh 22.5W, 2 cổng USB-A + 1 cổng Type-C, màn hình LED hiển thị pin.",
    image: img("photo-1585790050230-5dd28404ccb9"),
    createdAt: new Date(),
  },
  {
    name: "Chuột không dây êm ái",
    category: "thiet-bi-so",
    price: 320000,
    description: "Kết nối 2.4GHz + Bluetooth, 4 nút bấm, pin dùng tới 18 tháng, chuyển động mượt 4000 DPI.",
    image: img("photo-1527814050087-3793815479db"),
    createdAt: new Date(),
  },
  {
    name: "Bàn phím cơ không dây",
    category: "thiet-bi-so",
    price: 990000,
    description: "Switch Red êm ái, kết nối 3 chế độ, keycap PBT chống bám dầu, LED rainbow.",
    image: "https://gearshop.vn/upload/images/Product/Aula/F75/b%C3%A0n-ph%C3%ADm-aula-F75-Gaming-Ice-Blue-Reaper-Switch-(1).png",
    createdAt: new Date(),
  },
  {
    name: "Camera IP wifi trong nhà",
    category: "thiet-bi-so",
    price: 690000,
    description: "Quan sát 2K, quay quét 360°, đàm thoại 2 chiều, xem qua điện thoại, hồng ngoại ban đêm.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/11/Camera_IP.JPG",
    createdAt: new Date(),
  },
  {
    name: "Ốp lưng sạc không dây MagSafe",
    category: "thiet-bi-so",
    price: 420000,
    description: "Ốp lưng phủ silicone chống sốc, sạc không dây từ tính 15W cho iPhone 12 trở lên.",
    image: img("photo-1524678714210-9917a6c619c2"),
    createdAt: new Date(),
  },
  {
    name: "Cân điện tử nhà bếp",
    category: "gia-dung",
    price: 250000,
    description: "Cân điện tử bếp tối đa 5kg, chia độ chính xác 1gam, màn hình LCD, mặt kính cường lực dễ lau chùi.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Escali_digital_kitchen_scale.jpg",
    createdAt: new Date(),
  },
  {
    name: "Máy lọc không khí mini",
    category: "nha-cua",
    price: 1590000,
    description: "Lọc bụi mịn PM2.5 với màng HEPA, đèn thông báo chất lượng không khí, hoạt động êm ái 28dB.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Air_Purifier_%28Levoit_LV-H133%29_%2849317867758%29.jpg/960px-Air_Purifier_%28Levoit_LV-H133%29_%2849317867758%29.jpg",
    createdAt: new Date(),
  },
  {
    name: "Hub USB-C 8 trong 1",
    category: "thiet-bi-so",
    price: 780000,
    description: "HDMI 4K@60Hz, 3 cổng USB 3.0, 2 cổng Type-C, đọc thẻ SD/microSD, sạc qua PD 100W.",
    image: img("photo-1550009158-9ebf69173e03"),
    createdAt: new Date(),
  },
  {
    name: "Tay cầm chơi game Bluetooth",
    category: "game",
    price: 560000,
    description: "Tương thích iOS/Android/PC, rung phản hồi, kích tay bóp nhạy, pin 15 giờ.",
    image: img("photo-1587825140708-dfaf72ae4b04"),
    createdAt: new Date(),
  },
  {
    name: "Đèn bàn thông minh cảm ứng",
    category: "nha-cua",
    price: 480000,
    description: "Chỉnh 3 chế độ sáng, cảm ứng trượt, cổng sạc USB tích hợp, thiết kế gập 180°.",
    image: img("photo-1507473885765-e6ed057f782c"),
    createdAt: new Date(),
  },
  {
    name: "Điện thoại thông minh 5G",
    category: "dien-thoai",
    price: 7490000,
    description: "Màn hình AMOLED 120Hz, camera chính 50MP, pin 5000mAh sạc nhanh 33W, hỗ trợ hai SIM.",
    image: img("photo-1511707171634-5f897ff02aa9"),
    createdAt: new Date(),
  },
  {
    name: "Laptop mỏng nhẹ 14 inch",
    category: "laptop",
    price: 15490000,
    description: "CPU mới nhất, RAM 16GB, SSD 512GB, màn hình 14 inch độ phân giải 2.2K, nặng chỉ 1.3kg.",
    image: img("photo-1496181133206-80ce9b88a853"),
    createdAt: new Date(),
  },
  {
    name: "Tivi LED Full HD 24 inch",
    category: "thiet-bi-so",
    price: 2190000,
    description: "Màn hình 24 inch Full HD, ứng dụng Smart TV, loa stereo, 2 cổng HDMI 1 cổng USB.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/28/Sony_Bravia_24_Inch_LED_TV_Model_W60.jpg",
    createdAt: new Date(),
  },
  {
    name: "Máy chiếu văn phòng",
    category: "thiet-bi-so",
    price: 2790000,
    description: "Độ sáng 4200 lumen, độ tương phản 30000:1, cổng HDMI/VGA, phù hợp phòng họp vừa và nhỏ.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/14/InFocus_IN34.jpg",
    createdAt: new Date(),
  },
  {
    name: "Webcam Full HD họp trực tuyến",
    category: "thiet-bi-so",
    price: 490000,
    description: "Quay 1080p 30fps, micro khử ồn, chống ngược sáng, gắn trên màn hình hoặc đặt bàn.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/79/Webcam_%28Logitech_c922%29.jpg",
    createdAt: new Date(),
  },
  {
    name: "Máy bay camera 4K",
    category: "may-anh",
    price: 8990000,
    description: "Flycam gập gọn, camera 4K chống rung 3 trục, bay 30 phút, điều khiển tầm xa 5km.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/33/DJI_Mavic_2_Pro_with_Hasselblad_Camera_and_DJI_Mavic_Pro.jpg",
    createdAt: new Date(),
  },
  {
    name: "Máy pha cà phê vị Espresso",
    category: "gia-dung",
    price: 1890000,
    description: "Dùng viên nén, áp suất 19 bar, nước nóng nhanh 25 giây, khay chứa nước 1 lít.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Machine_Nespresso_professionnelle_-10.JPG/960px-Machine_Nespresso_professionnelle_-10.JPG",
    createdAt: new Date(),
  },
];

// Danh mục của 50 sản phẩm bổ sung, giữ đúng thứ tự khai báo bên dưới.
// Danh mục của 20 sản phẩm gốc được ghi trực tiếp trong từng object.
const SAN_PHAM_BO_SUNG_DANH_MUC = [
  "thoi-trang", "am-thanh", "gia-dung", "dong-ho", "dong-ho",
  "thoi-trang", "may-anh", "laptop", "laptop", "the-thao",
  "am-thanh", "lam-dep", "lam-dep", "dong-ho", "dien-thoai",
  "may-anh", "laptop", "thiet-bi-so", "lam-dep", "dien-thoai",
  "thoi-trang", "thoi-trang", "thoi-trang", "nha-cua", "lam-dep",
  "am-thanh", "thoi-trang", "gia-dung", "the-thao", "the-thao",
  "am-thanh", "thoi-trang", "am-thanh", "lam-dep", "lam-dep",
  "nha-cua", "game", "thiet-bi-so", "thoi-trang", "game",
  "laptop", "thiet-bi-so", "thoi-trang", "dien-thoai", "the-thao",
  "am-thanh", "lam-dep", "thiet-bi-so", "nha-cua", "thiet-bi-so",
];

// 50 sản phẩm bổ sung: [tên, giá (VND), mô tả, id ảnh Unsplash]
// Ảnh đã được đối chiếu thủ công: mỗi URL trả về 200 và đúng chủ đề sản phẩm.
const sanPhamBoSung = [
  ["Giày sneaker da lộn cổ thấp", 1290000, "Form cổ thấp, da lộn mềm phối viền, đế cao su đúc liền, đệm lót êm cho cả ngày dài.", "photo-1460353581641-37baddab0fa2"],
  ["Tai nghe chụp tai cổ điển", 1390000, "Màng loa 40mm, khung kim loại gập gọn, dây 3.5mm dài 1.2m, âm trung ấm và chi tiết.", "photo-1484704849700-f032a568e944"],
  ["Bộ 4 tách sứ pha cà phê", 390000, "Gồm 4 tách sứ tráng men trắng, dung tích 200ml, giữ nhiệt tốt, an toàn với máy rửa chén.", "photo-1495474472287-4d71bcdd2085"],
  ["Đồng hồ dây vải canvas", 1890000, "Máy quartz Nhật, mặt 40mm chống nước 5ATM, dây canvas thay nhanh, phong cách tối giản.", "photo-1508057198894-247b23fe5ade"],
  ["Đồng hồ thể thao GPS", 5990000, "Định vị GPS, đo nhịp tim liên tục, hơn 40 chế độ luyện tập, pin dùng 6 ngày, chống nước 5ATM.", "photo-1508685096489-7aacd43bd3b1"],
  ["Kính mát gọng kim loại tròn", 690000, "Gọng hợp kim siêu nhẹ, tròng chống tia UV400, thiết kế tròn cổ điển, kèm hộp đựng.", "photo-1511499767150-a48a237f0083"],
  ["Máy ảnh không gương lật kèm ống kính", 18900000, "Cảm biến APS-C 24MP, quay 4K 30fps, kèm ống kính kit 16-50mm và 2 pin dự phòng.", "photo-1516035069371-29a1b244cc32"],
  ["Laptop 13 inch vỏ kim loại", 21990000, "Vỏ nhôm nguyên khối, màn hình 13 inch 2.5K, RAM 16GB, SSD 512GB, nặng 1.2kg.", "photo-1517336714731-489689fd1ca8"],
  ["Laptop 14 inch cho lập trình viên", 19490000, "Màn hình 14 inch chống chói, bàn phím hành trình sâu, RAM 16GB, SSD 1TB, pin 12 giờ.", "photo-1517694712202-14dd9538aa97"],
  ["Bộ tạ đòn tập gym", 2450000, "Đòn tạ 1.2m kèm bánh tạ tổng 40kg, khóa tạ chắc chắn, phù hợp tập sức mạnh tại nhà.", "photo-1517836357463-d25dfeac3438"],
  ["Loa thông minh trợ lý ảo", 990000, "Điều khiển bằng giọng nói, kết nối Wi-Fi và Bluetooth, âm thanh 360°, đèn LED phản hồi.", "photo-1518444065439-e933c06ce9cd"],
  ["Bộ mỹ phẩm trang điểm 6 món", 750000, "Gồm phấn nền, phấn mắt, má hồng, son và cọ, bảng màu tông ấm dễ dùng hằng ngày.", "photo-1522335789203-aabd1fc54bc9"],
  ["Serum dưỡng tóc phục hồi", 420000, "Chiết xuất dầu argan và keratin, giảm xơ rối và gãy rụng, dùng cho tóc uốn hoặc nhuộm.", "photo-1522337360788-8b13dee7a37e"],
  ["Đồng hồ chronograph thể thao", 3290000, "Mặt 44mm, 3 mặt số phụ đo giây, thép không gỉ, chống nước 10ATM, khóa bấm an toàn.", "photo-1523170335258-f5ed11844a49"],
  ["Điện thoại màn hình 6.1 inch", 11990000, "Màn hình OLED 6.1 inch, camera kép 12MP chống rung, chip 6nm, sạc không dây 15W.", "photo-1523206489230-c012c64b2b48"],
  ["Máy ảnh in lấy liền", 3150000, "In ảnh khổ 54x86mm trong 90 giây, đèn flash tự động, kèm 10 tấm phim và dây đeo.", "photo-1526170375885-4d8ecf77b99f"],
  ["Laptop gaming 15 inch", 27490000, "Màn hình 15 inch 144Hz, card đồ họa rời 6GB, tản nhiệt hai quạt, bàn phím RGB 4 vùng.", "photo-1531297484001-80022131f5a1"],
  ["Bàn phím Bluetooth mỏng", 890000, "Kết nối 3 thiết bị, phím êm hành trình ngắn, pin sạc dùng 2 tháng, tương thích Windows và macOS.", "photo-1541140532154-b024d705b90a"],
  ["Nước hoa nữ Eau de Parfum", 2890000, "Hương hoa nhài và gỗ đàn hương, lưu hương 8-10 giờ, dung tích 50ml, phù hợp dùng hằng ngày.", "photo-1541643600914-78b084683601"],
  ["Máy tính bảng 11 inch kèm bút cảm ứng", 12490000, "Màn hình 11 inch 120Hz, hỗ trợ bút cảm ứng độ trễ thấp, 4 loa stereo, pin dùng 10 giờ.", "photo-1544244015-0df4b3ffc6b0"],
  ["Ba lô da thời trang", 1190000, "Da PU cao cấp, ngăn laptop 14 inch có đệm, khóa đồng, sức chứa 18 lít.", "photo-1547949003-9792a18a2601"],
  ["Giày sneaker phối màu nâu", 1450000, "Phối màu nâu camel, đế Air êm, cổ thấp dễ phối đồ, lót trong kháng khuẩn.", "photo-1549298916-b41d501d3772"],
  ["Ba lô laptop 15.6 inch", 690000, "Vải chống thấm nước, ngăn laptop 15.6 inch, cổng sạc USB tích hợp, quai đeo êm vai.", "photo-1553062407-98eeb64c6a62"],
  ["Sofa vải bọc nỉ 3 chỗ", 6900000, "Khung gỗ sồi, đệm mút đàn hồi cao 3 lớp, vải nỉ chống bám bẩn, dài 2.1m.", "photo-1556228453-efd6c1ff04f6"],
  ["Kem dưỡng ẩm phục hồi da", 380000, "Ceramide và panthenol, phục hồi hàng rào ẩm, kết cấu mỏng thấm nhanh, dùng cho da khô.", "photo-1556228720-195a672e8a03"],
  ["Tai nghe studio chuyên nghiệp", 2190000, "Tai nghe kiểm âm đóng, trở kháng 47 ohm, dây xoắn 3m tháo rời, phù hợp thu âm và mix.", "photo-1558756520-22cfe5d382ca"],
  ["Giày da lộn nam công sở", 1690000, "Da lộn màu xanh rêu, đế gỗ và cao su chống trượt, form ôm chân, phù hợp mặc với suit.", "photo-1560343090-f0409e92791a"],
  ["Máy xay cà phê hạt", 1590000, "Lưỡi xay thép 38 nấc, phễu 250g, động cơ êm, xay đều cho espresso và pour-over.", "photo-1570222094114-d054a817e56b"],
  ["Thảm tập yoga chống trượt", 290000, "Dày 6mm, bề mặt chống trượt hai mặt, chất liệu TPE không mùi, kèm dây đeo.", "photo-1571019613454-1cb2f99b2d8b"],
  ["Bộ tay cầm chống đẩy", 350000, "Hai tay cầm xoay 360°, giảm áp lực cổ tay, đế cao su chống trượt, chịu tải 150kg.", "photo-1571019614242-c5c5dee9f50b"],
  ["Tai nghe true wireless chống ồn", 4490000, "Chống ồn chủ động 2 chế độ, xuyên âm, hộp sạc không dây, nghe liên tục 6 giờ.", "photo-1572569511254-d8f925fe2cbb"],
  ["Kính mát gọng nhựa đen", 450000, "Gọng nhựa acetate, tròng phân cực chống loá, thiết kế unisex, kèm khăn lau và hộp.", "photo-1572635196237-14b3f281503f"],
  ["Tai nghe chụp tai có dây", 790000, "Màng loa 40mm, đệm tai giả da, dây 3.5mm có micro, gập gọn khi di chuyển.", "photo-1583394838336-acd977736f90"],
  ["Nước hoa hương gỗ unisex", 3190000, "Hương gỗ trầm, hổ phách và vanilla, lưu hương 10 giờ, dung tích 50ml, dùng cho cả nam và nữ.", "photo-1585386959984-a4155224a1ad"],
  ["Serum vitamin C sáng da", 550000, "Vitamin C 10% kết hợp niacinamide, làm mờ thâm và đều màu da, dùng buổi sáng kèm chống nắng.", "photo-1585652757141-8837d676fac8"],
  ["Ghế thư giãn bọc nỉ", 2890000, "Khung thép, đệm mút dày, chân gỗ tự nhiên, tải trọng 120kg, phù hợp phòng đọc sách.", "photo-1586023492125-27b2c045efd7"],
  ["Vỏ case máy tính kính cường lực", 1490000, "Hai mặt kính cường lực, hỗ trợ main ATX và tản nhiệt nước 360mm, kèm 3 quạt RGB.", "photo-1587202372775-e229f172b9d7"],
  ["Bàn phím không dây cho Mac", 1290000, "Kết nối Bluetooth, layout tối giản, pin sạc Type-C dùng 1 tháng, phím scissor êm.", "photo-1587829741301-dc798b83add3"],
  ["Túi xách nữ da tổng hợp", 1890000, "Da tổng hợp dập vân, quai ngắn và dây đeo dài tháo rời, 2 ngăn chính, khoá kim loại.", "photo-1590874103328-eac38a683ce7"],
  ["Máy chơi game console 4K", 13900000, "Hỗ trợ 4K 120fps, ổ SSD 825GB, tay cầm không dây phản hồi rung, kèm 1 game cài sẵn.", "photo-1593305841991-05c297ba4575"],
  ["Laptop văn phòng 13.3 inch", 16990000, "Màn hình 13.3 inch Full HD, RAM 8GB, SSD 256GB, nặng 1.1kg, pin dùng cả ngày làm việc.", "photo-1593642632823-8f785ba67e45"],
  ["Bàn phím cơ mini 65%", 1190000, "68 phím, hot-swap, kết nối Bluetooth và có dây, keycap PBT, đèn nền RGB tùy chỉnh.", "photo-1595225476474-87563907a212"],
  ["Giày sneaker pastel nữ", 1590000, "Phối pastel hồng và xanh, đế dày 3cm tôn dáng, da tổng hợp dễ vệ sinh.", "photo-1595950653106-6c9ebd614d3a"],
  ["Điện thoại Android màn hình 6.7 inch", 6990000, "Màn hình AMOLED 120Hz, pin 5000mAh sạc 67W, camera chính 64MP, có NFC.", "photo-1598327105666-5b89351aff97"],
  ["Giày chạy bộ đệm khí", 1990000, "Đệm khí toàn bộ đế, lưới thoáng khí, trọng lượng 260g mỗi chiếc, phù hợp chạy 5-10km.", "photo-1600185365483-26d7a4cc7519"],
  ["Tai nghe không dây kèm hộp sạc", 1290000, "Bluetooth 5.3, chống nước IPX4, nghe 5 giờ mỗi lần sạc, hộp sạc dự phòng 20 giờ.", "photo-1606220945770-b5b6c2c55bf1"],
  ["Tinh dầu dưỡng da thiên nhiên", 320000, "Tinh dầu jojoba và vitamin E, dưỡng ẩm và làm dịu da, dùng được cho da nhạy cảm.", "photo-1608571423902-eed4a5ad8108"],
  ["Chuột không dây văn phòng", 290000, "Thiết kế công thái học, cảm biến 1600 DPI, im lặng khi bấm, pin AA dùng 12 tháng.", "photo-1615663245857-ac93bb7c39e7"],
  ["Sofa góc chữ L", 9900000, "Sofa góc chữ L bọc vải, khung gỗ, đệm mút đàn hồi, kích thước 2.6 x 1.6m, tháo rời vỏ bọc.", "photo-1616486338812-3dadae4b4ace"],
  ["Bàn phím cơ 87 phím", 1390000, "Layout TKL, switch nâu êm, đèn nền trắng, kê tay tháo rời, dây USB-C.", "photo-1618384887929-16ec33fab9ef"],
].map(([name, price, description, photo], i) => ({
  name,
  price,
  description,
  image: img(photo),
  category: SAN_PHAM_BO_SUNG_DANH_MUC[i],
  // Giãn createdAt để thứ tự sản phẩm trên trang chủ ổn định giữa các lần seed
  createdAt: new Date(Date.now() - i * 1000),
}));

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

// 50 khách hàng bổ sung, mật khẩu chung: user123
const CUSTOMER_NAMES = [
  "Nguyễn Văn An",
  "Trần Thị Bình",
  "Lê Hoàng Cường",
  "Phạm Thu Dung",
  "Hoàng Minh Đức",
  "Vũ Thị Hà",
  "Đặng Quốc Huy",
  "Bùi Thanh Hương",
  "Ngô Văn Khánh",
  "Đỗ Thị Lan",
  "Trịnh Văn Long",
  "Lý Thị Mai",
  "Phan Anh Minh",
  "Cao Thị Ngọc",
  "Nguyễn Bảo Nam",
  "Trần Hồng Nhung",
  "Lê Văn Phúc",
  "Phạm Minh Quân",
  "Hoàng Thị Quỳnh",
  "Vũ Đức Sơn",
  "Đặng Thu Thảo",
  "Bùi Văn Thắng",
  "Ngô Thị Thu",
  "Đỗ Minh Trí",
  "Trịnh Thị Trang",
  "Lý Văn Tú",
  "Phan Thị Tuyết",
  "Cao Văn Vinh",
  "Nguyễn Thị Xuân",
  "Trần Văn Yên",
  "Lê Thị Ánh",
  "Phạm Quốc Bảo",
  "Hoàng Văn Chiến",
  "Vũ Thị Diệp",
  "Đặng Văn Dũng",
  "Bùi Thị Giang",
  "Ngô Văn Hải",
  "Đỗ Thị Hằng",
  "Trịnh Văn Hiếu",
  "Lý Thị Hoa",
  "Phan Văn Hưng",
  "Cao Thị Kim",
  "Nguyễn Văn Lâm",
  "Trần Thị Linh",
  "Lê Văn Mạnh",
  "Phạm Thị Nga",
  "Hoàng Văn Nghĩa",
  "Vũ Thị Oanh",
  "Đặng Văn Phong",
  "Bùi Thị Yến",
];

const khachHang = CUSTOMER_NAMES.map((name, i) => {
  const stt = String(i + 1).padStart(2, "0");
  return {
    name,
    email: `user${stt}@tmdt.vn`,
    passwordHash: hashPassword("user123"),
    role: "user",
    // Ngày tạo lùi dần để danh sách quản trị có thứ tự ổn định
    createdAt: new Date(Date.now() - (i + 1) * 86400000),
  };
});

const allProducts = [...products, ...sanPhamBoSung];
const allUsers = [...users, ...khachHang];

// Bộ sinh số ngẫu nhiên có hạt: mỗi lần seed cho cùng một bộ đơn hàng,
// nhờ vậy số liệu dashboard ổn định và dễ đối chiếu khi kiểm thử.
function taoBoSinh(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const DEMO_ORDER_COUNT = 60;
// Phương thức được lặp lại theo tỉ lệ mong muốn (COD phổ biến nhất)
const DEMO_PAYMENTS = [
  "COD", "COD", "COD",
  "BANK_TRANSFER", "BANK_TRANSFER",
  "CARD", "CARD",
  "CASH",
];

// Sinh 60 đơn mẫu từ chính 54 tài khoản và 70 sản phẩm ở trên, trải trong 45
// ngày gần nhất (20 đơn rơi vào 7 ngày cuối để biểu đồ tuần có dữ liệu).
async function seedDemoOrders(db) {
  const orderCollection = db.collection("orders");
  const removed = await orderCollection.deleteMany({ seedDemo: true });

  const productDocs = await db.collection("products").find({}).sort({ createdAt: 1 }).toArray();
  const customers = await db.collection("users").find({ role: "user" }).toArray();
  if (productDocs.length === 0 || customers.length === 0) {
    return { created: 0, removed: removed.deletedCount };
  }

  const rand = taoBoSinh(20261116);
  const now = Date.now();
  const docs = [];

  for (let n = 0; n < DEMO_ORDER_COUNT; n++) {
    // Trải thời gian: 20 đơn đầu (mới nhất) trong 7 ngày, còn lại lùi tới 45 ngày
    const daysAgo = n < 20 ? rand() * 6 : 7 + rand() * 38;
    const createdAt = new Date(now - daysAgo * 86400000 - rand() * 6 * 3600000);

    // 1-3 sản phẩm khác nhau, mỗi sản phẩm 1-2 chiếc
    const itemCount = 1 + Math.floor(rand() * 3);
    const chosen = new Set();
    while (chosen.size < Math.min(itemCount, productDocs.length)) {
      chosen.add(Math.floor(rand() * productDocs.length));
    }
    const items = [...chosen].map((index) => {
      const p = productDocs[index];
      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        qty: 1 + Math.floor(rand() * 2),
        category: p.category || "khac",
      };
    });
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const paymentMethod = DEMO_PAYMENTS[Math.floor(rand() * DEMO_PAYMENTS.length)];
    // COD chưa chốt tiền ngay, nhưng khoảng một nửa đơn COD cũ đã thu tiền khi giao
    const paid = paymentMethod !== "COD" || rand() < 0.5;

    let status;
    if (paid) {
      const r = rand();
      status = r < 0.5 ? "ĐÃ THANH TOÁN" : r < 0.8 ? "ĐANG GIAO HÀNG" : "HOÀN THÀNH";
    } else {
      const r = rand();
      status =
        r < 0.2 ? "MỚI" : r < 0.75 ? "CHỜ GIAO HÀNG" : r < 0.92 ? "ĐANG GIAO HÀNG" : "ĐÃ HUỶ";
    }

    const user = customers[Math.floor(rand() * customers.length)];
    docs.push({
      userId: String(user._id),
      items,
      total,
      status,
      paid,
      paymentMethod,
      ...(paid ? { paidAt: new Date(createdAt.getTime() + 3600000) } : {}),
      createdAt,
      seedDemo: true,
    });
  }

  await orderCollection.insertMany(docs);
  return { created: docs.length, removed: removed.deletedCount };
}

async function main() {
  // Chặn sớm lỗi dữ liệu: một danh mục gõ sai sẽ làm sản phẩm biến mất khỏi
  // bộ lọc danh mục trên web/mobile mà không ai nhận ra.
  const validCategories = new Set(CATEGORIES.map((c) => c.slug));
  const invalid = allProducts.filter((p) => !validCategories.has(p.category));
  if (invalid.length > 0) {
    throw new Error(
      `Danh mục không hợp lệ ở sản phẩm: ${invalid.map((p) => `${p.name} (${p.category})`).join(", ")}`
    );
  }

  await connect(config.mongoUri, config.dbName);
  const db = getDb();

  const productCollection = db.collection("products");
  const userCollection = db.collection("users");

  // Upsert thay vì xoá sạch: chạy lại seed chỉ thêm/cập nhật bản ghi trong danh
  // sách dưới đây, không làm mất đơn hàng hay sản phẩm tự thêm từ trang quản trị.
  const productResult = await productCollection.bulkWrite(
    allProducts.map(({ createdAt, ...p }) => ({
      updateOne: {
        filter: { name: p.name },
        update: { $set: p, $setOnInsert: { createdAt } },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  const userResult = await userCollection.bulkWrite(
    allUsers.map(({ name, email, passwordHash, role, createdAt }) => ({
      updateOne: {
        filter: { email },
        update: { $set: { name, role, passwordHash }, $setOnInsert: { createdAt } },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  // Đơn mẫu được thay mới mỗi lần chạy; đơn do người dùng thật đặt (không có
  // cờ seedDemo) luôn được giữ nguyên.
  const demoOrders = await seedDemoOrders(db);

  const totalProducts = await productCollection.countDocuments();
  const totalUsers = await userCollection.countDocuments();
  const totalOrders = await db.collection("orders").countDocuments();

  await productCollection.createIndex({ category: 1 });
  await db.collection("orders").createIndex({ createdAt: -1 });

  console.log(`Đã nạp ${allProducts.length} sản phẩm (thêm mới: ${productResult.upsertedCount}) — tổng trong DB: ${totalProducts}.`);
  console.log(`Đã nạp ${allUsers.length} tài khoản (thêm mới: ${userResult.upsertedCount}) — tổng trong DB: ${totalUsers}.`);
  console.log(`Đã tạo ${demoOrders.created} đơn hàng mẫu (thay ${demoOrders.removed} đơn mẫu cũ) — tổng trong DB: ${totalOrders}.`);
  console.log("Tài khoản demo:");
  console.log("  admin@tmdt.vn / admin123  (role: admin)");
  console.log("  thanh@tmdt.vn / thanh123, minh@tmdt.vn / minh123, lan@tmdt.vn / lan123  (role: user)");
  console.log("  50 khách hàng: user01@tmdt.vn … user50@tmdt.vn / user123  (role: user)");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed thất bại:", err.message);
  process.exit(1);
});
