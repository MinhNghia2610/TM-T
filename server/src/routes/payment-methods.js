// Danh mục phương thức thanh toán: một nơi duy nhất cho cả server (validate) và client (hiển thị)
const PAYMENT_METHODS = [
  {
    code: "COD",
    label: "Thanh toán khi nhận hàng (COD)",
    description: "Bạn trả tiền mặt cho người giao hàng khi nhận được đơn.",
    instant: false, // không chốt tiền ngay, đơn chờ giao
  },
  {
    code: "CASH",
    label: "Tiền mặt",
    description: "Trả tiền mặt trực tiếp tại cửa hàng.",
    instant: true,
  },
  {
    code: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản tới tài khoản ngân hàng của cửa hàng.",
    instant: true,
    bank: {
      bankName: "VCB",
      bankLabel: "Vietcombank",
      accountNumber: "0123456789",
      accountName: "CONG TY TNHH TECH ZONE",
      branch: "Hội sở chính, TP. Hồ Chí Minh",
    },
  },
  {
    code: "CARD",
    label: "Thẻ (Visa/Master/NapAS)",
    description: "Thanh toán bằng thẻ điện thoại/điện tử (mô phỏng).",
    instant: true,
  },
];

const VALID_CODES = PAYMENT_METHODS.map((m) => m.code);

function isValidMethod(code) {
  return VALID_CODES.includes(code);
}

function getMethod(code) {
  return PAYMENT_METHODS.find((m) => m.code === code) || null;
}

module.exports = { PAYMENT_METHODS, VALID_CODES, isValidMethod, getMethod };
