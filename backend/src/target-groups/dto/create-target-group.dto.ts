import { IsString, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateTargetGroupDto {
  @ApiProperty({
    description: 'Target group name',
    example: 'Men',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  name: string;
}
