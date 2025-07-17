import { IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginAccountDto {
  @ApiProperty({
    description: 'Email or phone number',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  emailAndPhone: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsNotEmpty()
  password: string;
}
