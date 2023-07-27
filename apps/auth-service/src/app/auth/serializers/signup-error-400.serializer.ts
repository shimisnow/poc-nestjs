import { ApiProperty } from '@nestjs/swagger';

export class SignUpError400Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '',
    example: ['username should not be empty'],
  })
  message: Array<string>;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Bad Request',
  })
  error: string;
}
