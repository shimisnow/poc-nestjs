import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyUsernameQueryDto {
  @ApiProperty({
    description: 'Username to be verified',
    example: 'anderson',
  })
  @IsNotEmpty()
  username: string;
}
