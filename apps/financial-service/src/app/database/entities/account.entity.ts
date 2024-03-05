import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AccountStatusEnum } from '../enums/account-status.enum';

@Entity({
  name: 'accounts',
})
@Index('idx_accounts', ['accountId', 'userId'], { unique: true })
export class AccountEntity {
  @PrimaryGeneratedColumn({
    name: 'account_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_accounts',
  })
  accountId: number;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
  })
  userId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AccountStatusEnum,
    enumName: 'account_status_enum',
    default: AccountStatusEnum.ACTIVE,
    nullable: true,
  })
  status?: AccountStatusEnum;
}
