import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpBodyDto {
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
    description: 'Password in plain text',
    example: 'test@1234',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
