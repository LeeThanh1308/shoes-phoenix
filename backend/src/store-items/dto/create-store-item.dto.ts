import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreItemDto {
  @ApiProperty({
    description: 'Store item ID (optional)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  id: number;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 10,
    minimum: 0,
  })
  @Min(0)
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  productID: number;

  @ApiProperty({
    description: 'Size ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  sizeID: number;

  @ApiProperty({
    description: 'Color ID (optional)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  colorID: number;
}
