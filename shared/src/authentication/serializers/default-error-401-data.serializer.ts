import { ApiProperty } from '@nestjs/swagger';
import { AUTHENTICATION_ERROR } from '../enums/authentication-error.enum';

export class DefaultError401DataSerializer {
  @ApiProperty({
    description: 'Unique error name. Can be used to identify the error',
    type: 'enum',
    enum: AUTHENTICATION_ERROR,
    required: true,
  })
  name: AUTHENTICATION_ERROR;

  @ApiProperty({
    description: 'List with one or more error messages',
    type: [String],
    required: false,
    example: [
      'jwt expired',
      'maxAge exceeded',
      'invalid signature',
      'exp must be a number conforming to the specified constraints',
      'wrong user or password information',
    ],
  })
  errors?: Array<string>;

  @ApiProperty({
    description: 'Available when the error is related to expired token',
    type: Date,
    required: false,
    example: '2024-02-08T12:21:56.000Z',
  })
  expiredAt?: Date;
}
