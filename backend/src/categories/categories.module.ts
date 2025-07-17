import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategorySeed } from './categories.seed';
import { FilesModule } from 'src/files/files.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), FilesModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategorySeed],
  exports: [],
})
export class CategoriesModule {
  constructor(private readonly categorySeed: CategorySeed) {
    this.categorySeed.handleCreateDefaultData();
  }
}
