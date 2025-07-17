import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductColor } from './entities/product-color.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductColorSeed {
  private readonly defaultData: Array<Partial<ProductColor>> = [
    { name: 'Đỏ', hexCode: '#FF0000' },
    { name: 'Xanh dương', hexCode: '#0000FF' },
    { name: 'Xanh lá', hexCode: '#00FF00' },
    { name: 'Vàng', hexCode: '#FFFF00' },
    { name: 'Tím', hexCode: '#800080' },
    { name: 'Hồng', hexCode: '#FFC0CB' },
    { name: 'Cam', hexCode: '#FFA500' },
    { name: 'Nâu', hexCode: '#8B4513' },
    { name: 'Đen', hexCode: '#000000' },
    { name: 'Trắng', hexCode: '#FFFFFF' },
    { name: 'Xám', hexCode: '#808080' },
    { name: 'Xanh da trời', hexCode: '#87CEEB' },
    { name: 'Xanh lục lam', hexCode: '#00FFFF' },
    { name: 'Xanh ngọc', hexCode: '#40E0D0' },
    { name: 'Xanh rêu', hexCode: '#556B2F' },
    { name: 'Be', hexCode: '#F5F5DC' },
    { name: 'Kem', hexCode: '#FFFDD0' },
    { name: 'Đỏ đô', hexCode: '#800000' },
    { name: 'Hồng cánh sen', hexCode: '#FF69B4' },
    { name: 'Vàng chanh', hexCode: '#FFF700' },
  ];
  constructor(
    @InjectRepository(ProductColor)
    private readonly productColorRepository: Repository<ProductColor>,
  ) {}

  async handleCreateDefaultData() {
    const findData = await this.productColorRepository.find();
    if (findData.length == 0) {
      const createColors = await Promise.all(
        this.defaultData.map((_) => {
          return this.productColorRepository.create(_);
        }),
      );
      const data = await this.productColorRepository.save(createColors);
      Logger.log(`Create data colors succeed ${data?.length}`);
    }
  }
}
