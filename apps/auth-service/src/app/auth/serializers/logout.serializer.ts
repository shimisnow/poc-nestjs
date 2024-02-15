import { ApiProperty } from '@nestjs/swagger';

export class LogoutSerializer {
  @ApiProperty({
    description: 'Information if the logout process was performed',
    example: true,
  })
  performed: boolean;

  @ApiProperty({
    description: 'Number of milliseconds for this date since the epoch',
    example: 1707755084516,
  })
  performedAt: number;
}
