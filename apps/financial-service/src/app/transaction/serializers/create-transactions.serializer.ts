import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionSerializer {
  @ApiProperty({
    description: 'Created transaction id',
    example: 456,
  })
  transactionId: number;
}
