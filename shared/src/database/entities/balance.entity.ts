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
    nullable: true,
    default: 0,
  })
  balance?: number;

  @UpdateDateColumn({
    name: 'update_at',
    type: 'timestamp',
    nullable: true,
  })
  updateAt?: Date;
}
