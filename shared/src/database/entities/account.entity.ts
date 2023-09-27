import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'accounts',
})
@Index(['accountId', 'userId'], { unique: true })
export class AccountEntity {
  @PrimaryGeneratedColumn({
    name: 'account_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_accounts',
  })
  accountId: number;

  @Column({
    name: 'user_id',
    type: 'integer',
    nullable: false,
  })
  userId: number;
}
