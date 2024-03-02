import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionError412Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 412,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'PreconditionFailed',
  })
  message: string;

  @ApiProperty({
    description: 'Error information',
    example: {
      name: 'InsufficientAccountBalance',
    },
  })
  data: {
    name: string;
  };
}
