import { ApiProperty } from '@nestjs/swagger';

export class GetBalanceError400Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '',
    example: ['accountId should not be empty'],
  })
  message: Array<string>;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Bad Request',
  })
  error: string;
}
