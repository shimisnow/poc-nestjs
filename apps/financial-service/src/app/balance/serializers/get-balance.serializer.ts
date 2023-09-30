import { ApiProperty } from "@nestjs/swagger";

export class GetBalanceSerializer {
  @ApiProperty({
    description: 'Updated account balance',
    example: 1234.56,
  })
  balance: number;
}
