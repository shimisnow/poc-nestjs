import { ApiProperty } from '@nestjs/swagger';

export class DefaultError500Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 500,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Additional error message',
    example: 'Cannot set properties of undefined',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Internal Server Error',
  })
  error: string;
}
