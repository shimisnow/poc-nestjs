import { ApiProperty } from '@nestjs/swagger';

export class PasswordChangeError400Serializer {
  @ApiProperty({
    description: 'HTTP code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '',
    example: ['currentPassword should not be empty'],
  })
  message: Array<string>;

  @ApiProperty({
    description: 'HTTP error message',
    example: 'Bad Request',
  })
  error: string;
}
