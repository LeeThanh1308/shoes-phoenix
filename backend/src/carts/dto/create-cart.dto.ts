import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({
    description: 'Quantity of items to add to cart',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Product size ID',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  sizeID: number;

  @ApiProperty({
    description: 'Product color ID',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  colorID: number;
}
