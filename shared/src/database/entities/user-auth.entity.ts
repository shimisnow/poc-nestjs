import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAuthStatusEnum } from '../enums/user-auth-status.enum';

@Entity({
  name: 'user_auths',
})
export class UserAuthEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'integer',
    nullable: false,
    primaryKeyConstraintName: 'pk_user_auths',
  })
  userId: number;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  @Index('idx_user_auths_username', {
    unique: true,
  })
  username: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserAuthStatusEnum,
    enumName: 'user_auth_status_enum',
    default: UserAuthStatusEnum.ACTIVE,
    nullable: true,
  })
  status?: UserAuthStatusEnum;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt?: Date;
}
