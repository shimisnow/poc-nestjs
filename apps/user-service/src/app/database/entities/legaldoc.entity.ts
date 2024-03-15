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
import { LegalDocTypeEnum } from '../enums/legal-doc-type.enum';

/**
 * TypeORM Entity with legal doc information.
 */
@Entity({
  name: 'legal_docs',
})
@Index('idx_legal_docs_type_user', ['type', 'user'], { unique: true })
export class LegalDocEntity {
  @PrimaryGeneratedColumn('increment', {
    name: 'legal_doc_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_legal_docs',
  })
  legalDocId: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: LegalDocTypeEnum,
    enumName: 'legal_doc_type_enum',
    nullable: false,
  })
  type?: LegalDocTypeEnum;

  @Column({
    name: 'identifier',
    type: 'varchar',
    length: 30,
    nullable: false,
  })
  identifier: string;

  @Column({
    name: 'country_code',
    type: 'enum',
    enum: CountryCodeEnum,
    enumName: 'country_code_enum',
    nullable: false,
  })
  @ManyToOne(() => CountryEntity, (country) => country.code)
  @JoinColumn({
    name: 'country_code',
    referencedColumnName: 'code',
    foreignKeyConstraintName: 'fk_legaldocs_countries',
  })
  country: CountryEntity;

  @Column({
    name: 'user_id',
    nullable: false,
  })
  @ManyToOne(() => UserEntity, (user) => user.userId)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
    foreignKeyConstraintName: 'fk_legal_docs_users',
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
