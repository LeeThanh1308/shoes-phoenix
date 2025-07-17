import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import {
  OrderPaymentStatus,
  PaymentStatusKey,
} from '../types/enum/status-payment.enum';

import { CreatePaymentDto } from './create-payment.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsOptional()
  @IsEnum(PaymentStatusKey)
  paymentStatus: PaymentStatusKey;

  @IsOptional()
  @IsEnum(OrderPaymentStatus)
  orderStatus: OrderPaymentStatus;
}
