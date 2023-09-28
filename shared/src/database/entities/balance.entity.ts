import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from './account.entity';
import { TransactionEntity } from './transaction.entity';

@Entity({
  name: 'balances',
})
export class BalanceEntity {
  @PrimaryColumn({
    name: 'account_id',
    type: 'integer',
    nullable: false,
    primaryKeyConstraintName: 'pk_balances',
  })
  @OneToOne(() => AccountEntity)
  @JoinColumn({
    name: 'account_id',
    referencedColumnName: 'accountId',
    foreignKeyConstraintName: 'fk_balances_accounts',
  })
  account: AccountEntity;

  @Column({
    name: 'balance',
    type: 'real',
    nullable: false,
    default: 0,
  })
  balance: number;

  @Column({
    name: 'last_transaction_id',
    type: 'integer',
    nullable: false,
    default: 0,
  })
  @OneToOne(() => TransactionEntity, (transaction) => transaction.transactionId)
  @JoinColumn({
    name: 'last_transaction_id',
    referencedColumnName: 'transactionId',
    foreignKeyConstraintName: 'fk_balances_transactions',
  })
  lastTransaction: TransactionEntity;

  @UpdateDateColumn({
    name: 'update_at',
    type: 'timestamp',
    nullable: true,
  })
  updateAt?: Date;
}
