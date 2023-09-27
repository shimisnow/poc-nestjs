import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class GetBalanceQueryDto {
  @ApiProperty({
    description: 'Account ID',
    minimum: 1,
    example: 4225,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  accountId: number;
}
