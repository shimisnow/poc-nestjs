import { Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'accounts',
})
export class AccountEntity {
  @PrimaryGeneratedColumn({
    name: 'account_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_accounts',
  })
  accountId: number;

  @PrimaryColumn({
    name: 'user_id',
    type: 'integer',
    nullable: false,
    primaryKeyConstraintName: 'pk_accounts',
  })
  userId: number;
}
