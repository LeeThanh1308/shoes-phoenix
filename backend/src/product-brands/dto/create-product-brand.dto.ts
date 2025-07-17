import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsUnique } from 'src/common/validators/unique.validator';
import { ProductBrand } from '../entities/product-brand.entity';

export class CreateProductBrandDto {
  @ApiProperty({
    description: 'Brand name',
    example: 'Nike',
  })
  @IsString()
  @IsNotEmpty()
  @IsUnique(ProductBrand, 'name')
  name: string;

  @ApiProperty({
    description: 'Brand slug (URL-friendly name)',
    example: 'nike',
  })
  @IsString()
  @IsNotEmpty()
  @IsUnique(ProductBrand, 'slug')
  slug: string;

  @ApiProperty({
    description: 'Brand logo path',
    example: 'nike-logo.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({
    description: 'Brand description',
    example: 'Just Do It',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
