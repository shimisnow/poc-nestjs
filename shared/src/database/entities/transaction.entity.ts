import {
  AfterInsert,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionTypeEnum } from '../enums/transaction-type.enum';

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

  @PrimaryColumn({
    name: 'account_id',
    type: 'integer',
    nullable: false,
    primaryKeyConstraintName: 'pk_transactions',
  })
  accountId: number;

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
    type: 'integer',
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
