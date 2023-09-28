import { ApiProperty } from '@nestjs/swagger';
import { TransactionTypeEnum } from '@shared/database/enums/transaction-type.enum';
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateTransactionBodyDto {
  @ApiProperty({
    description: 'Account ID',
    minimum: 1,
    example: 4225,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  accountId: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionTypeEnum,
    example: TransactionTypeEnum.DEBIT,
  })
  @IsNotEmpty()
  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @ApiProperty({
    description: 'Transaction amount',
    minimum: 0.01,
    example: 1500.34,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;
}
