import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginBodyDto {
  @ApiProperty({
    description: 'Username',
    example: 'anderson',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User password in plain text',
    example: 'te$st@12%34',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'If the request should include a refreshToken',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requestRefreshToken?: boolean = false;
}
