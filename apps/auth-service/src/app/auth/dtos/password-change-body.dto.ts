import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordChangeBodyDto {
  @ApiProperty({
    description: 'Current password in plain text',
    example: 'test@1234',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password in plain text',
    example: '1234@test',
  })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
