import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { CreateProductColorDto } from './create-product-color.dto';
import { CreateProductSizeDto } from './create-product-size.dto';
import { IsUnique } from 'src/common/validators/unique.validator';
import { Product } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Nike Air Max 270' })
  @IsString()
  @IsNotEmpty()
  @IsUnique(Product, 'name')
  name: string;

  @ApiProperty({ description: 'Product slug', example: 'nike-air-max-270' })
  @IsString()
  @IsNotEmpty()
  @IsUnique(Product, 'slug')
  slug: string;

  @ApiProperty({ description: 'Product barcode', example: '1234567890123' })
  @IsString()
  @IsNotEmpty()
  @IsUnique(Product, 'barcode')
  barcode: string;

  @ApiProperty({
    description: 'Product description',
    required: false,
    example: 'Comfortable running shoes',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Cost price', example: 100000 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  costPrice: number;

  @ApiProperty({ description: 'Selling price', example: 150000 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  sellingPrice: number;

  @ApiProperty({
    description: 'Discount percentage (0-100)',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount: number;

  @ApiProperty({
    description: 'Product active status',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiProperty({ description: 'Brand ID', required: false, example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  brandID: number;

  @ApiProperty({ description: 'Target group ID', example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  targetGroupID: number;

  @ApiProperty({ description: 'Category ID', example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  categoryID: number;

  @ApiProperty({
    description: 'Product colors',
    type: [CreateProductColorDto],
    example: [{ colorID: 1, quantity: 10 }],
  })
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductColorDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(CreateProductColorDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  colors: CreateProductColorDto[];

  @ApiProperty({
    description: 'Product sizes',
    type: [CreateProductSizeDto],
    example: [{ sizeID: 1, quantity: 10 }],
  })
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductSizeDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(CreateProductSizeDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  sizes: CreateProductSizeDto[];
}
