import { ApiProperty } from '@nestjs/swagger';

export class PasswordChangeSerializer {
  @ApiProperty({
    description: 'Information if the password change process was performed',
    example: true,
  })
  performed: boolean;
}
