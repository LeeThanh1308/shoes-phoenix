import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({
    description: 'Blog title',
    example: 'Top 10 Running Shoes for 2024',
    maxLength: 160,
  })
  @IsString()
  @MaxLength(160)
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Blog slug (URL-friendly title)',
    example: 'top-10-running-shoes-2024',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Blog content/description',
    example: 'Discover the best running shoes for this year...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
