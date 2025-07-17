import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDto {
  @ApiProperty({
    description: 'Reply content',
    example: 'I agree with your comment!',
    required: false,
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  content: string;

  @ApiProperty({
    description: 'Comment ID to reply to',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  commentID: number;

  @ApiProperty({
    description: 'Account ID being replied to',
    example: 'user123',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountReplyID: string;
}
