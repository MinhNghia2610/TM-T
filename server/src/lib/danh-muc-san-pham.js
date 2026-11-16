// Danh mục sản phẩm: một nguồn duy nhất cho seed, API lọc và module quản trị.
// `slug` được lưu trong products.category và trong từng dòng đơn hàng (snapshot),
// nhờ vậy báo cáo doanh thu theo danh mục không phụ thuộc vào việc sản phẩm còn
// tồn tại hay đã bị xoá.
const CATEGORIES = [
  {
    slug: "am-thanh",
    label: "Âm thanh",
    icon: "🎧",
    description: "Tai nghe, loa và thiết bị nghe nhạc.",
  },
  {
    slug: "dien-thoai",
    label: "Điện thoại & Máy tính bảng",
    icon: "📱",
    description: "Smartphone, tablet và phụ kiện đi kèm.",
  },
  {
    slug: "laptop",
    label: "Laptop & Máy tính",
    icon: "💻",
    description: "Laptop văn phòng, đồ hoạ và gaming.",
  },
  {
    slug: "may-anh",
    label: "Máy ảnh & Flycam",
    icon: "📷",
    description: "Máy ảnh, ống kính và thiết bị bay.",
  },
  {
    slug: "dong-ho",
    label: "Đồng hồ",
    icon: "⌚",
    description: "Đồng hồ thông minh và đồng hồ cơ.",
  },
  {
    slug: "lam-dep",
    label: "Làm đẹp & Chăm sóc da",
    icon: "💄",
    description: "Nước hoa, mỹ phẩm và dưỡng da.",
  },
  {
    slug: "thoi-trang",
    label: "Thời trang & Phụ kiện",
    icon: "👟",
    description: "Giày, túi xách, kính mát và ba lô.",
  },
  {
    slug: "nha-cua",
    label: "Nhà cửa & Nội thất",
    icon: "🛋️",
    description: "Sofa, ghế, đèn và thiết bị trong nhà.",
  },
  {
    slug: "gia-dung",
    label: "Gia dụng & Bếp",
    icon: "🍳",
    description: "Đồ dùng bếp và máy pha cà phê.",
  },
  {
    slug: "the-thao",
    label: "Thể thao & Ngoài trời",
    icon: "🏋️",
    description: "Dụng cụ tập luyện tại nhà.",
  },
  {
    slug: "thiet-bi-so",
    label: "Thiết bị số & Phụ kiện",
    icon: "🔌",
    description: "Bàn phím, chuột, màn hình và phụ kiện.",
  },
  {
    slug: "game",
    label: "Gaming",
    icon: "🎮",
    description: "Console, tay cầm và linh kiện chơi game.",
  },
  // Danh mục dự phòng cho sản phẩm cũ hoặc do quản trị viên tạo mà chưa chọn
  // danh mục. Luôn tồn tại để dữ liệu không bao giờ rơi vào trạng thái "không rõ".
  {
    slug: "khac",
    label: "Khác",
    icon: "🧩",
    description: "Sản phẩm chưa được phân danh mục.",
  },
];

const DEFAULT_CATEGORY = "khac";
const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

function isValidCategory(slug) {
  return CATEGORY_SLUGS.includes(slug);
}

function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

// Nhãn hiển thị an toàn: dữ liệu cũ thiếu category vẫn có nhãn thay vì undefined
function categoryLabel(slug) {
  return getCategory(slug)?.label || getCategory(DEFAULT_CATEGORY).label;
}

module.exports = {
  CATEGORIES,
  CATEGORY_SLUGS,
  DEFAULT_CATEGORY,
  isValidCategory,
  getCategory,
  categoryLabel,
};
