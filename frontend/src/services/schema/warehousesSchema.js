import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(1, "Tên kho hàng không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  description: z.string().optional(),
  manager: z.string().min(1, "Người quản lý không được để trống"),
  capacity: z.number().min(1, "Sức chứa phải lớn hơn 0"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const warehouseUpdateSchema = warehouseSchema.partial();

export const stockOperationSchema = z.object({
  warehouseId: z.number().min(1, "ID kho hàng không hợp lệ"),
  productId: z.number().min(1, "ID sản phẩm không hợp lệ"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  notes: z.string().optional(),
});

export const transferStockSchema = z.object({
  fromWarehouseId: z.number().min(1, "ID kho nguồn không hợp lệ"),
  toWarehouseId: z.number().min(1, "ID kho đích không hợp lệ"),
  productId: z.number().min(1, "ID sản phẩm không hợp lệ"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  notes: z.string().optional(),
});
