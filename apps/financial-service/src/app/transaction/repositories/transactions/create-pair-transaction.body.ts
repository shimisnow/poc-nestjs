import { TransactionTypeEnum } from '../../../database/enums/transaction-type.enum';

/** Defines the information needed to create a pair transaction */
export class CreatePairTransactionBody {
  /** Transaction one */
  from: {
    /** Account to be linked with this transaction */
    accountId: number;
    /** Recommended that 'from' and 'to' to be different types */
    type: TransactionTypeEnum;
    /** Recommended to be negative value for debit transaction */
    amount: number;
  };

  /** Transaction two */
  to: {
    /** Account to be linked with this transaction */
    accountId: number;
    /** Recommended that 'from' and 'to' to be different types */
    type: TransactionTypeEnum;
    /** Recommended to be negative value for debit transaction */
    amount: number;
  };
}
