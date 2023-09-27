import { TransactionTypeEnum } from '@shared/database/enums/transaction-type.enum';

export class CreateTransactionBodyDto {
  accountId: number;
  type: TransactionTypeEnum;
  amount: number;
}
