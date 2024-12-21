import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  QueryFailedError,
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
   * User unique id to be used by this and other services.
   */
  @PrimaryGeneratedColumn('uuid', {
    name: 'user_id',
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
    length: 20,
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
    length: 60,
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

  /**
   * Verifies the username.
   */
  @BeforeInsert()
  @BeforeUpdate()
  private validateUsername() {
    if (/^[a-z0-9]*([_.][a-z0-9]*)?$/.test(this.username) == false) {
      throw new QueryFailedError(
        'Validation failed',
        [],
        new Error(
          'username allows only lowercase letters, digits and one underscore or period allowed',
        ),
      );
    }
  }
}
