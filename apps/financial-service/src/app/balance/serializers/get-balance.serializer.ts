import { ApiProperty } from '@nestjs/swagger';

export class GetBalanceSerializer {
  @ApiProperty({
    description: 'Account balance',
    example: 1234.56,
  })
  balance: number;

  @ApiProperty({
    description: 'Informs if the value was retrieved from cache',
    example: true,
  })
  cached: boolean;

  @ApiProperty({
    description: 'Informs when the value was cached',
    example: 1707925199374,
    required: false,
  })
  cachedAt?: number;
}
