import { ApiProperty } from '@nestjs/swagger';

export class SignUpSerializer {
  status: boolean;

  @ApiProperty({
    description: 'Generated user unique ID to be used at all services',
    required: false,
    example: 'cf0accda-2ace-415b-8b02-5bd8bf267a9c',
  })
  userId?: string;
}
