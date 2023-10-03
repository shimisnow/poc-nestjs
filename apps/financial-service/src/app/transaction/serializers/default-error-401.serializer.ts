import { ApiProperty } from '@nestjs/swagger';

export class DefaultError401Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Unauthorized',
  })
  message: string;
}
