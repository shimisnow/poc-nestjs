import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from './account.entity';
import { TransactionEntity } from './transaction.entity';

@Entity({
  name: 'balances',
})
export class BalanceEntity {
  @PrimaryGeneratedColumn({
    name: 'balance_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_balances',
    comment:
      'this field exists only because a primary key is required in typeorm. Do not use it',
  })
  balanceId: number;

  @Index('idx_balances', { unique: true })
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
  @OneToOne(() => TransactionEntity)
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
