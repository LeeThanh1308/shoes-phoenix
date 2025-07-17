import { IsNumber, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Branch name',
    example: 'Store Central',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Branch address',
    example: '123 Main Street, District 1, Ho Chi Minh City',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Branch phone number',
    example: '+84123456789',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 106.6297,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 10.8231,
  })
  @IsNumber()
  latitude: number;
}
