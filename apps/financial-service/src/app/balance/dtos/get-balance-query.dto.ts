import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class GetBalanceQueryDto {
  @ApiProperty({
    description: 'Account ID',
    minimum: 1,
    example: 4225,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  accountId: number;
}
