import { Logger, Module } from '@nestjs/common';

import { ProductColor } from './entities/product-color.entity';
import { ProductColorSeed } from './product-colors.seed';
import { ProductColorsController } from './product-colors.controller';
import { ProductColorsService } from './product-colors.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProductColor])],
  controllers: [ProductColorsController],
  providers: [ProductColorsService, ProductColorSeed],
})
export class ProductColorsModule {
  constructor(private readonly productColorSeed: ProductColorSeed) {
    this.productColorSeed.handleCreateDefaultData();
  }
}
