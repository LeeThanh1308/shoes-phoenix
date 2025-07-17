import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Rating score (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  score?: number;

  @ApiProperty({
    description: 'Comment content',
    example: 'Great product, highly recommended!',
    required: false,
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  content: string;

  @ApiProperty({
    description: 'Product ID (if commenting on a product)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  productID: number;

  @ApiProperty({
    description: 'Blog ID (if commenting on a blog)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  blogID: number;
}
