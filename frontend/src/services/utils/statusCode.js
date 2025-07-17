const orderStatusKey = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  UNPACKED: "Chờ đóng gói",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Giao hàng thành công",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
  OUT_OF_STOCK: "Hết hàng",
  PAID_IN_STORE: "Đã thanh toán tại cửa hàng",
  PENDING_IN_STORE: "Chờ thanh toán tại cửa hàng",
};

const paymentStatusKey = {
  PAID: "Đã thanh toán",
  PENDING: "Chờ thanh toán",
  PROCESSING: "Đang xử lý",
  CANCELLED: "Đã hủy",
};

const paymentStatusValue = {
  PAID: "PAID",
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  CANCELLED: "CANCELLED",
};

export { orderStatusKey, paymentStatusKey, paymentStatusValue };
