export type TypeOrderPaymentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'UNPACKED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED'
  | 'OUT_OF_STOCK'
  | 'PAID_IN_STORE'
  | 'PENDING_IN_STORE';
export enum OrderPaymentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  UNPACKED = 'UNPACKED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PENDING_IN_STORE = 'PENDING_IN_STORE',
  PAID_IN_STORE = 'PAID_IN_STORE',
}

export enum OrderPaymentStatusVI {
  PENDING = 'Chờ xử lý',
  CONFIRMED = 'Đã xác nhận',
  PROCESSING = 'Đang xử lý',
  UNPACKED = 'Chờ đóng gói',
  SHIPPING = 'Đang giao hàng',
  DELIVERED = 'Giao hàng thành công',
  COMPLETED = 'Hoàn tất',
  CANCELLED = 'Đã hủy',
  FAILED = 'Thất bại',
  REFUNDED = 'Đã hoàn tiền',
  OUT_OF_STOCK = 'Hết hàng',
  PAID_IN_STORE = 'Đã thanh toán tại cửa hàng',
  PENDING_IN_STORE = 'Chưa thanh toán tại cửa hàng',
}

export type TypePaymentStatus = 'PAID' | 'PENDING' | 'PROCESSING' | 'CANCELLED';

export enum PaymentStatusKey {
  PAID = 'PAID',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CANCELLED = 'CANCELLED',
}
export enum PaymentStatusVI {
  PAID = 'Đã thanh toán',
  PENDING = 'Chờ thanh toán',
  PROCESSING = 'Đang xử lý',
  CANCELLED = 'Đã hủy',
}

export enum OrderPaymentMethod {
  CASH = 'Thanh toán khi nhận hàng',
  TRANSFER = 'Thanh toán trực tuyến',
}
