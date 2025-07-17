import { IsNumber, IsOptional } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateLikeDto {
  @ApiProperty({
    description: 'Comment ID to like',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  commentID?: number;

  @ApiProperty({
    description: 'Reply ID to like',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  replyID?: number;

  @ApiProperty({
    description: 'Blog ID to like',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  blogID?: number;
}
