import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionTypeEnum } from '../enums/transaction-type.enum';
import { AccountEntity } from './account.entity';

@Entity({
  name: 'transactions',
})
export class TransactionEntity {
  @PrimaryGeneratedColumn({
    name: 'transaction_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_transactions',
  })
  transactionId?: number;

  @Column({
    name: 'account_id',
    type: 'integer',
    nullable: false,
  })
  @ManyToOne(() => AccountEntity, (account) => account.accountId)
  @JoinColumn({
    name: 'account_id',
    referencedColumnName: 'accountId',
    foreignKeyConstraintName: 'fk_transactions_accounts',
  })
  account: AccountEntity;

  @Column({
    name: 'type',
    type: 'enum',
    enum: TransactionTypeEnum,
    enumName: 'transaction_type_enum',
    nullable: false,
  })
  type: TransactionTypeEnum;

  @Column({
    name: 'amount',
    type: 'real',
    nullable: false,
  })
  amount: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt?: Date;
}
