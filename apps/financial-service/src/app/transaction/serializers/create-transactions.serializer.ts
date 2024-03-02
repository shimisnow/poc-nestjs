import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionSerializer {
  @ApiProperty({
    description: 'Transaction id',
    example: 123,
  })
  fromTransactionId: number;

  @ApiProperty({
    description: 'Transaction id',
    example: 456,
  })
  toTransactionId: number;
}
