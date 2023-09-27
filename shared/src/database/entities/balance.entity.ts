import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

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
  accountId: number;

  @Column({
    name: 'balance',
    type: 'integer',
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
  lastTransactionId: number;

  @UpdateDateColumn({
    name: 'update_at',
    type: 'timestamp',
    nullable: true,
  })
  updateAt?: Date;
}
