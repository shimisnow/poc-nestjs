import { ApiProperty } from '@nestjs/swagger';

export class GetBalanceError404Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'The account does not exist',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Not Found',
  })
  error: string;
}
