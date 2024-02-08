import { ApiProperty } from '@nestjs/swagger';
import { DefaultError401DataSerializer } from './default-error-401-data.serializer';

export class DefaultError401Serializer {
  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Unauthorized',
  })
  message: string;

  @ApiProperty({
    description: 'Information about the error',
    required: false,
  })
  data?: DefaultError401DataSerializer;
}
