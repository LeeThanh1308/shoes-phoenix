import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategorySeed {
  private readonly defaultData: Array<Partial<Category>> = [
    { name: 'Rèm cuốn', slug: 'rem-cuon' },
    { name: 'Rèm vải', slug: 'rem-vai' },
    { name: 'Rèm cầu vồng', slug: 'rem-cau-vong' },
    { name: 'Rèm sáo nhôm', slug: 'rem-sao-nhom' },
    { name: 'Rèm gỗ', slug: 'rem-go' },
    { name: 'Rèm Roman', slug: 'rem-roman' },
    { name: 'Rèm lá dọc', slug: 'rem-la-doc' },
    { name: 'Rèm che bàn thờ', slug: 'rem-che-ban-tho' },
    { name: 'Rèm cuốn in tranh', slug: 'rem-cuon-in-tranh' },
    { name: 'Mành ngang', slug: 'manh-ngang' },
    { name: 'Mành đứng', slug: 'manh-dung' },
    { name: 'Động cơ rèm', slug: 'dong-co-rem' },
    { name: 'Bạt ban công', slug: 'bat-ban-cong' },
    { name: 'Vách rèm tổ ong', slug: 'vach-rem-to-ong' },
  ];
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async handleCreateDefaultData() {
    const findData = await this.categoryRepository.find();
    if (findData.length == 0) {
      const createColors = await Promise.all(
        this.defaultData.map((_) => {
          return this.categoryRepository.create(_);
        }),
      );
      const data = await this.categoryRepository.save(createColors);
      Logger.log(`Create data category succeed ${data?.length}`);
    }
  }
}
