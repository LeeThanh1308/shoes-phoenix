import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import {
  OrderPaymentMethod,
  OrderPaymentStatus,
  PaymentStatusKey,
  TypeOrderPaymentStatus,
  TypePaymentStatus,
} from '../types/enum/status-payment.enum';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Order } from 'src/orders/entities/order.entity';
import { TempOrder } from 'src/temp-orders/entities/temp-order.entity';

@Entity()
export class Payment extends BaseModel {
  @Column({
    type: 'enum',
    enum: OrderPaymentMethod,
  })
  paymentMethod: OrderPaymentMethod;

  @Column({ nullable: false })
  receiver: string;

  @Column({ nullable: false })
  phone: string;

  @Column()
  address: string;

  @Column()
  note: string;

  @Column({ select: false, nullable: true })
  orderCode: number;

  @Column({
    type: 'enum',
    enum: PaymentStatusKey,
    default: null,
    nullable: true,
  })
  paymentStatus: TypePaymentStatus;

  @Column({
    type: 'enum',
    enum: OrderPaymentStatus,
    default: OrderPaymentStatus.PENDING,
  })
  orderStatus: TypeOrderPaymentStatus;

  @Column({ type: 'decimal', precision: 12, nullable: false })
  price: number; // Giá cho size này

  @ManyToOne(() => Accounts, (accounts) => accounts.payments, {
    onDelete: 'CASCADE',
  })
  @Index()
  account: Accounts;

  @ManyToOne(() => Accounts, (accounts) => accounts.staffPayments, {
    onDelete: 'CASCADE',
  })
  @Index()
  staff: Accounts;

  @OneToMany(() => TempOrder, (tempOrder) => tempOrder.payment, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  tempOrders: TempOrder[];

  @OneToMany(() => Order, (order) => order.payment, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  orders: Order[];
}
