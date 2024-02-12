import { ApiProperty } from '@nestjs/swagger';

export class LogoutSerializer {
  @ApiProperty({
    description: 'Information if the logout process was performed',
    example: true,
  })
  performed: boolean;
}
