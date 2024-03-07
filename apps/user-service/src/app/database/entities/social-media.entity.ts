import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { SocialMediaTypeEnum } from '../enums/social-media-type.enum';

/**
 * TypeORM Entity with social media information.
 */
@Entity({
  name: 'social_medias',
})
export class SocialMediaEntity {
  @PrimaryGeneratedColumn('increment', {
    name: 'social_media_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_social_medias',
  })
  socialMediaId: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: SocialMediaTypeEnum,
    enumName: 'social_media_type_enum',
    nullable: false,
  })
  type: SocialMediaTypeEnum;

  @Column({
    name: 'identifier',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  identifier: string;

  @Column({
    name: 'user_id',
    nullable: false,
  })
  @ManyToOne(() => UserEntity, (user) => user.userId)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
    foreignKeyConstraintName: 'fk_social_medias_users',
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
