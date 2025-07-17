import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { CreateStoreItemDto } from 'src/store-items/dto/create-store-item.dto';

export class CreateStoreDto {
  @ApiProperty({
    description: 'Store ID (optional)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  id: number;

  @ApiProperty({
    description: 'Branch ID where the store is located',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  branchID: number;

  @ApiProperty({
    description: 'Array of store items',
    type: [CreateStoreItemDto],
    example: [
      {
        productID: 1,
        quantity: 10,
        price: 150000,
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1) // 👈 yêu cầu phải có ít nhất 1 phần tử trong mảng
  @ValidateNested({ each: true })
  @Type(() => CreateStoreItemDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(CreateStoreItemDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  items: CreateStoreItemDto[];
}
