import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { Accounts } from 'src/accounts/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { IsUnique } from 'src/common/validators/unique.validator';
import { Type } from 'class-transformer';

export class CreateVerificationDto {
  @ApiProperty({
    description: 'Email address for verification',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsUnique(Accounts, 'email', 'id')
  email: string;

  @ApiProperty({
    description: 'Verification code',
    example: 123456,
  })
  @IsNumber()
  code: number;

  @ApiProperty({
    description: 'Account data for registration',
    type: CreateAccountDto,
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAccountDto)
  data?: CreateAccountDto;

  @ApiProperty({
    description: 'Whether this is for password reset',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  forget_password?: boolean;
}
