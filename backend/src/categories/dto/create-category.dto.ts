import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Validate,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';
import { IsUnique } from 'src/common/validators/unique.validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Running Shoes',
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  @IsUnique(Category, 'name')
  name: string;

  @ApiProperty({
    description: 'Category slug (URL-friendly name)',
    example: 'running-shoes',
    maxLength: 500,
  })
  @IsString()
  @Length(1, 500)
  @IsUnique(Category, 'slug')
  slug: string;

  @ApiProperty({
    description: 'Category icon (optional)',
    example: '🏃‍♂️',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Category active status',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiProperty({
    description: 'Parent category ID (for subcategories)',
    example: 1,
    required: false,
  })
  @IsOptional()
  parentId?: number;
}
