import { ApiProperty } from '@nestjs/swagger';

export class VerifyUsernameSerializer {
  @ApiProperty({
    description: 'Informs if the username is available for use',
    example: true,
  })
  available: boolean;
}
