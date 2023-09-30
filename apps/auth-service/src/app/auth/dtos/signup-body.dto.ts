import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SignUpBodyDto {
  @ApiProperty({
    description: 'User id from the main database',
    example: '76c9d285-ab38-48e2-b97b-7556150c11ce',
  })
  @IsUUID()
  userId: string;

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
