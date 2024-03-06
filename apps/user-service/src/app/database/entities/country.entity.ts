import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CountryCodeEnum } from '../enums/country-code.enum';

/**
 * TypeORM Entity with country information.
 */
@Entity({
  name: 'countries',
})
export class CountryEntity {
  /**
   * Country code as ISO 3166-1 Alfa 3.
   * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
   */
  @PrimaryColumn({
    name: 'country_code',
    type: 'enum',
    enum: CountryCodeEnum,
    enumName: 'country_code_enum',
    primaryKeyConstraintName: 'pk_countries',
    nullable: false,
  })
  countryCode: CountryCodeEnum;

  @Column({
    name: 'country_calling_code',
    type: 'integer',
    nullable: false,
  })
  countryCallingCode: number;

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
