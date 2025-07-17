import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsUnique } from 'src/common/validators/unique.validator';
import { Slider } from '../entities/slider.entity';
import { Transform } from 'class-transformer';

export class CreateSliderDto {
  @ApiProperty({
    description: 'Slider name',
    example: 'Summer Sale Banner',
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  @IsNotEmpty()
  @IsUnique(Slider, 'name', 'id')
  name: string;

  @ApiProperty({
    description: 'Slider slug (URL-friendly name)',
    example: 'summer-sale-banner',
    maxLength: 500,
  })
  @IsString()
  @Length(1, 500)
  @IsNotEmpty()
  @IsUnique(Slider, 'slug', 'id')
  slug: string;

  @ApiProperty({
    description: 'Slider link URL',
    example: '/sale/summer-collection',
    required: false,
  })
  @IsString()
  @IsOptional()
  href: string;
}
