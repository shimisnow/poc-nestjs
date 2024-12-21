import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginBodyDto {
  @ApiProperty({
    description:
      'Username, which can contain lowercase letters, digits, and one underscore or one period',
    example: 'anderson',
    minLength: 2,
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[a-z0-9]*([_.][a-z0-9]*)?$/, {
    message:
      'only lowercase letters, digits and one underscore or period allowed',
  })
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
