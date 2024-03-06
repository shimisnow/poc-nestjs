import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CountryEntity } from './country.entity';
import { CountryCodeEnum } from '../enums/country-code.enum';
import { PhoneTypeEnum } from '../enums/phone-type.enum';

/**
 * TypeORM Entity with phone information.
 */
@Entity({
  name: 'phones',
})
@Index('idx_phones_type_user', ['type', 'user'], { unique: true })
export class PhoneEntity {
  @PrimaryGeneratedColumn('increment', {
    name: 'phone_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_phones',
  })
  phoneId: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: PhoneTypeEnum,
    enumName: 'phone_type_enum',
    default: PhoneTypeEnum.MAIN,
    nullable: true,
  })
  type?: PhoneTypeEnum;

  @Column({
    name: 'number',
    type: 'integer',
    nullable: false,
  })
  number: number;

  @Column({
    name: 'country_code',
    type: 'enum',
    enum: CountryCodeEnum,
    enumName: 'country_code_enum',
    nullable: false,
  })
  @ManyToOne(() => CountryEntity, (country) => country.countryCode)
  @JoinColumn({
    name: 'country_code',
    referencedColumnName: 'countryCode',
    foreignKeyConstraintName: 'fk_phones_countries',
  })
  country: CountryEntity;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
  })
  @ManyToOne(() => UserEntity, (user) => user.userId)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
    foreignKeyConstraintName: 'fk_phones_users',
  })
  user: UserEntity;

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
