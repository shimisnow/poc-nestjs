import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionError403Serializer {
  @ApiProperty({
    description: 'HTTP error code',
    example: 403,
  })
  statusCode: number;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Forbidden',
  })
  message: string;

  @ApiProperty({
    description: 'Error information',
    type: 'raw',
    example: {
      name: 'InexistentOrInactiveAccount',
      errors: [
        'accountId does not exists or it is inactive',
        'pairAccountId does not exists or it is inactive',
      ],
    },
  })
  data: {
    name: string,
    errors: Array<string>,
  };
}
