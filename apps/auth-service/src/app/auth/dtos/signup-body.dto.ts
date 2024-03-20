import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpBodyDto {
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
