import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';
import { ProductSize } from 'src/product-sizes/entities/product-size.entity';
import { StoreItem } from 'src/store-items/entities/store-item.entity';

@Entity('temp-orders')
export class TempOrder extends BaseModel {
  @Column()
  name: string;

  @Column({ nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, nullable: false })
  totalAmount: number;

  @ManyToOne(() => Accounts, (accounts) => accounts.orders, {
    onDelete: 'CASCADE',
  })
  @Index()
  account: Accounts;

  @ManyToOne(() => Accounts, (accounts) => accounts.orderStaffs, {
    onDelete: 'CASCADE',
  })
  @Index()
  staff: Accounts;

  @ManyToOne(() => StoreItem, (storeItem) => storeItem.orders, {
    onDelete: 'CASCADE',
  })
  @Index()
  storeItem: StoreItem;

  @ManyToOne(() => ProductSize, (productSize) => productSize.orders, {
    onDelete: 'CASCADE',
  })
  @Index()
  size: ProductSize;

  @ManyToOne(() => ProductColor, (color) => color.orders, {
    onDelete: 'CASCADE',
  })
  @Index()
  color: ProductColor;

  @ManyToOne(() => Product, (product) => product.orders, {
    onDelete: 'CASCADE',
  })
  @Index()
  product: Product;

  @ManyToOne(() => Payment, (payment) => payment.tempOrders, {
    onDelete: 'CASCADE',
  })
  @Index()
  payment: Payment;
}
