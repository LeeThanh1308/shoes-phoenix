import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export enum SortOrder {
  NEWEST = 'newest', // Sắp xếp mới nhất
  OLDEST = 'oldest', // Sắp xếp muộn nhất
  PRICE_ASC = 'price_asc', // Sắp xếp theo giá từ thấp đến cao
  PRICE_DESC = 'price_desc', // Sắp xếp theo giá từ cao đến thấp
}

export class PriceRangeDto {
  @ApiProperty({
    description: 'Minimum price',
    example: 100000,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  min: number;

  @ApiProperty({
    description: 'Maximum price',
    example: 500000,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  max: number;
}

export class UseFiltersDto {
  @ApiProperty({
    description: 'Array of color IDs to filter by',
    example: ['1', '2', '3'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  colors: string[];

  @ApiProperty({
    description: 'Array of object IDs to filter by',
    example: ['1', '2'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  objects: string[];

  @ApiProperty({
    description: 'Array of brand IDs to filter by',
    example: ['1', '2'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  brands: string[];

  @ApiProperty({
    description: 'Array of category IDs to filter by',
    example: ['1', '2'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  categories: string[];

  @ApiProperty({
    description: 'Single object ID to filter by',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  object: string;

  @ApiProperty({
    description: 'Single brand ID to filter by',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  brand: string;

  @ApiProperty({
    description: 'Single category ID to filter by',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Price range filter',
    type: PriceRangeDto,
    required: false,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PriceRangeDto)
  priceRange: PriceRangeDto;
}

export class FiltersProductDto {
  @ApiProperty({
    description: 'Search keyword',
    example: 'nike running',
    required: false,
  })
  @IsString()
  @IsOptional()
  keyword: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsInt()
  @IsOptional()
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 10,
  })
  @IsInt()
  @IsOptional()
  limit: number;

  @ApiProperty({
    description: 'Advanced filters object',
    type: UseFiltersDto,
    required: false,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UseFiltersDto)
  @Transform(({ value }) => {
    console.log(value);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(UseFiltersDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  useFilters: UseFiltersDto;

  @ApiProperty({
    description: 'Sort order for results',
    enum: SortOrder,
    example: SortOrder.NEWEST,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOrder, {
    message:
      'Sort order must be one of the following: newest, oldest, price_asc, price_desc',
  })
  sortOrder: SortOrder;
}
