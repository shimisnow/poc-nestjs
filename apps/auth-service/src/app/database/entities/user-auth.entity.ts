import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAuthStatusEnum } from '../enums/user-auth-status.enum';
import { AuthRoleEnum } from '@shared/authentication/enums/auth-role.enum';
import * as bcrypt from 'bcrypt';

/**
 * TypeORM Entity with the user authentication information.
 */
@Entity({
  name: 'user_auths',
})
export class UserAuthEntity {
  /**
   * User ID previous generated and stored at the users table in another database.
   */
  @PrimaryColumn({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
    primaryKeyConstraintName: 'pk_user_auths',
  })
  userId: string;

  /**
   * Informs the user access type.
   */
  @Column({
    name: 'role',
    type: 'enum',
    enum: AuthRoleEnum,
    enumName: 'user_auth_role_enum',
    default: AuthRoleEnum.USER,
    nullable: true,
  })
  role?: AuthRoleEnum;

  /**
   * Username to generate access tokens.
   */
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

  /**
   * Password to generate access_tokens.
   * WARNING: the password should be provided as plain text.
   * The entity will apply the correct hash function before store.
   */
  @Column({
    name: 'password',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: string;

  /**
   * Informs if the user is active and can be used to generate access tokens.
   */
  @Column({
    name: 'status',
    type: 'enum',
    enum: UserAuthStatusEnum,
    enumName: 'user_auth_status_enum',
    default: UserAuthStatusEnum.ACTIVE,
    nullable: true,
  })
  status?: UserAuthStatusEnum;

  /**
   * Timestamp of insert operation.
   */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt?: Date;

  /**
   * Timestamp of the last update operation.
   */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt?: Date;

  /**
   * Hashes the password.
   */
  @BeforeInsert()
  @BeforeUpdate()
  private async passwordEncryption() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
