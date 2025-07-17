import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreatePaymentCashierDto {
  @IsIn(['cash', 'transfer'], {
    message: 'paymentMethod phải là "cash" hoặc "transfer"',
  })
  paymentMethod: 'cash' | 'transfer';

  @IsString()
  @IsOptional()
  receiver: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  address: string;

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
