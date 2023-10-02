import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionError412Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 412,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Insufficient account balance',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Precondition Failed',
  })
  error: string;
}
