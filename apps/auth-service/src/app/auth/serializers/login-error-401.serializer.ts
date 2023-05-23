import { ApiProperty } from '@nestjs/swagger';

export class LoginError401Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Unauthorized',
  })
  error: string;
}
