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
import { AddressTypeEnum } from '../enums/address-type.enum';
import { CountryCodeEnum } from '../enums/country-code.enum';

/**
 * TypeORM Entity with address information.
 */
@Entity({
  name: 'addresses',
})
@Index('idx_addresses_type_user', ['type', 'user'], { unique: true })
export class AddressEntity {
  @PrimaryGeneratedColumn('increment', {
    name: 'address_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_addresses',
  })
  addressId: number;

  @Column({
    name: 'postalcode',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  postalcode: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: AddressTypeEnum,
    enumName: 'address_type_enum',
    default: AddressTypeEnum.MAIN,
    nullable: true,
  })
  type?: AddressTypeEnum;

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
    foreignKeyConstraintName: 'fk_addresses_countries',
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
    foreignKeyConstraintName: 'fk_addresses_users',
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
