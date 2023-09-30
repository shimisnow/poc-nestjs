import { ApiProperty } from '@nestjs/swagger';

export class DefaultError502Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 502,
  })
  statusCode: number;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Bad Gateway',
  })
  message: string;
}
