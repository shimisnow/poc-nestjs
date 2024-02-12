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
}
