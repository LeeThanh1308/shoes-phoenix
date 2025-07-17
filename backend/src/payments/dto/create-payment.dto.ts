import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Payment method',
    example: 'cash',
    enum: ['cash', 'transfer'],
  })
  @IsIn(['cash', 'transfer'], {
    message: 'paymentMethod phải là "cash" hoặc "transfer"',
  })
  paymentMethod: 'cash' | 'transfer';

  @ApiProperty({
    description: 'Name of the receiver',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'receiver không được để trống' })
  receiver: string;

  @ApiProperty({
    description: 'Phone number (Vietnamese format)',
    example: '0123456789',
  })
  @IsPhoneNumber('VN', {
    message: 'phone phải là số điện thoại hợp lệ của Việt Nam',
  })
  @IsNotEmpty({ message: 'phone không được để trống' })
  phone: string;

  @ApiProperty({
    description: 'Delivery address',
    example: '123 Main Street, Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Please deliver in the morning',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  returnUrl?: string;

  @IsString()
  @IsOptional()
  cancelUrl?: string;
}
