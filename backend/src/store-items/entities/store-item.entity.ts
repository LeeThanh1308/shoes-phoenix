import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

import { BaseModel } from 'src/common/entities/BaseEntity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductColor } from 'src/product-colors/entities/product-color.entity';
import { ProductSize } from 'src/product-sizes/entities/product-size.entity';
import { Store } from 'src/stores/entities/store.entity';

@Entity('store-items')
export class StoreItem extends BaseModel {
  @Column({ type: 'int', nullable: false })
  quantity: number;

  @OneToMany(() => Order, (order) => order.storeItem)
  orders: Order[];

  @ManyToOne(() => Store, (store) => store.items, {
    onDelete: 'CASCADE',
  })
  @Index()
  store: Store;

  @ManyToOne(() => Product, (product) => product.items, {
    onDelete: 'CASCADE',
  })
  @Index()
  product: Product;

  @ManyToOne(() => ProductColor, (productColor) => productColor.items, {
    onDelete: 'CASCADE',
  })
  @Index()
  color: ProductColor;

  @ManyToOne(() => ProductSize, (productSize) => productSize.items, {
    onDelete: 'CASCADE',
  })
  @Index()
  size: ProductSize;
}
