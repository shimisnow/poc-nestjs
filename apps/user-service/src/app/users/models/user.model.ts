import { Field, ObjectType } from '@nestjs/graphql';
import { AddressModel } from '../../addresses/models/address.model';
import { PhoneModel } from '../../phones/models/phone.model';
import { LegalDocModel } from '../../legal-docs/models/legal-doc.model';
import { SocialMediaModel } from '../../social-medias/models/social-media.model';

/**
 * Person information
 */
@ObjectType({
  description: 'Person information',
})
export class UserModel {
  /**
   * Unique identifier as UUID
   */
  @Field(() => String, { description: 'Unique identifier as UUID' })
  userId: string;

  /**
   * A person name
   */
  @Field(() => String, { description: 'A person name' })
  name: string;

  /**
   * A person surname
   */
  @Field(() => String, { description: 'A person surname' })
  surname: string;

  /**
   * A person email
   */
  @Field(() => String, { description: 'A person email' })
  email: string;

  /**
   * Addresses associated with the person
   */
  @Field(() => [AddressModel], {
    description: 'Addresses associated with the person',
  })
  addresses: AddressModel[];

  /**
   * Phones associated with the person
   */
  @Field(() => [PhoneModel], {
    description: 'Phones associated with the person',
  })
  phones: PhoneModel[];

  /**
   * Legal docs associated with the person
   */
  @Field(() => [LegalDocModel], {
    description: 'Legal docs associated with the person',
  })
  legalDocs: LegalDocModel[];

  /**
   * Social medias associated with the person
   */
  @Field(() => [SocialMediaModel], {
    description: 'Social medias associated with the person',
  })
  socialMedias: AddressModel[];
}
