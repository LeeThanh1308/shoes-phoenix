import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Order name/description',
    example: 'Nike Air Max 270 - Size 42, Color Red',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Quantity of products',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Total amount of the order',
    example: 300000,
  })
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty({
    description: 'Account ID (customer)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  accountId: number;

  @ApiProperty({
    description: 'Staff ID (who processed the order)',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  staffId: number;

  @ApiProperty({
    description: 'Store item ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  storeItemId: number;

  @ApiProperty({
    description: 'Product size ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  sizeId: number;

  @ApiProperty({
    description: 'Product color ID',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  colorId?: number;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    description: 'Payment ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  paymentId: number;
}
