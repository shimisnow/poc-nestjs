import { ApiProperty } from '@nestjs/swagger';

export class VerifyUsernameError400Serializer {
  @ApiProperty({
    description: '',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '',
    example: ['username should not be empty'],
  })
  message: Array<string>;

  @ApiProperty({
    description: '',
    example: 'Bad Request',
  })
  error: string;
}
