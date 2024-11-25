import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { VerifyTokenAdditionalEnum } from '../enums/verify-token-additional.enum';

export class VerifyTokenInvalidationProcessBodyDto {
  @ApiProperty({
    description: 'User unique identification',
    example: '4799cc31-7692-40b3-afff-cc562baf5374',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Login request identifiction',
    example: '1707920014294',
  })
  @IsNotEmpty()
  @IsString()
  loginId: string;

  @ApiProperty({
    description: 'Token issued timestamp',
    example: 1731506427,
  })
  @IsNotEmpty()
  @IsNumber()
  iat: number;

  @ApiProperty({
    description: 'A list of additional verification to be performed',
    type: [String],
    enum: VerifyTokenAdditionalEnum,
    example: [VerifyTokenAdditionalEnum.IS_ACTIVE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(VerifyTokenAdditionalEnum, { each: true })
  verify: VerifyTokenAdditionalEnum[];
}
