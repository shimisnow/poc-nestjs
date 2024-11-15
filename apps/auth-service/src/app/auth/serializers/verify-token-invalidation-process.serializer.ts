import { ApiProperty } from '@nestjs/swagger';
import { InvalidatedErrorEnum } from '../enums/invalidated-error.enum';

export class VerifyTokenInvalidationProcessSerializer {
  @ApiProperty({
    description: 'Information if is valid against the invalidation process',
    example: false,
  })
  valid: boolean;

  @ApiProperty({
    description: 'Motive because the token is invalid',
    enum: InvalidatedErrorEnum,
    example: InvalidatedErrorEnum.INVALIDATED_BY_LOGOUT,
  })
  invalidatedBy?: InvalidatedErrorEnum;
}
