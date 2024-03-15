import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * TypeORM Entity with the user information.
 */
@Entity({
  name: 'users',
})
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'user_id',
    primaryKeyConstraintName: 'pk_users',
  })
  userId: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 30,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'surname',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  surname: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  email: string;

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
}
