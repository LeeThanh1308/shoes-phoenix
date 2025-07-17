import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Min,
  MinLength,
} from 'class-validator';

import { Accounts } from '../entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsUnique } from 'src/common/validators/unique.validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account ID (optional)', required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    description: 'Password (minimum 8 characters)',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Gender', enum: ['x', 'y', 'z'], example: 'x' })
  @IsEnum(['x', 'y', 'z'])
  @IsNotEmpty()
  gender: string;

  @ApiProperty({
    description: 'Phone number (Vietnamese format)',
    example: '+84123456789',
  })
  @IsPhoneNumber('VN')
  @IsNotEmpty()
  @IsUnique(Accounts, 'phone', 'id')
  phone: string;

  @ApiProperty({ description: 'Birthday', example: '1990-01-01' })
  @IsDateString()
  birthday: Date;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @Length(1, 50)
  @IsNotEmpty()
  @IsUnique(Accounts, 'email', 'id')
  email: string;

  @ApiProperty({ description: 'Avatar image path', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'Account ban status',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  ban?: boolean;

  @ApiProperty({ description: 'Refresh token', required: false })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}
