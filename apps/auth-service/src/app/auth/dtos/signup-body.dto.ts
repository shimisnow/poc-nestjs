import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class SignUpBodyDto {
  @ApiProperty({
    description: 'User id from the main database',
    example: 4233,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  userId: number;

  @ApiProperty({
    description: 'User name',
    example: 'anderson',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'test@1234',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
