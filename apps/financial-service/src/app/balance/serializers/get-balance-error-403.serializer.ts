import { ApiProperty } from '@nestjs/swagger';

export class GetBalanceError403Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 403,
  })
  statusCode: number;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Forbidden',
  })
  message: string;
}
