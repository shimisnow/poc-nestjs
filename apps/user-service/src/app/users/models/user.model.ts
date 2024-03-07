import { Field, ObjectType } from '@nestjs/graphql';
import { AddressModel } from '../../addresses/models/address.model';
import { PhoneModel } from '../../phones/models/phone.model';
import { LegalDocModel } from '../../legal-docs/models/legal-doc.model';
import { SocialMediaModel } from '../../social-medias/models/social-media.model';

@ObjectType({
  description: 'Person information',
})
export class UserModel {
  @Field(() => String, { description: 'Unique identifier as UUID' })
  userId: string;

  @Field(() => String, { description: 'A person name' })
  name: string;

  @Field(() => String, { description: 'A person surname' })
  surname: string;

  @Field(() => String, { description: 'A person email' })
  email: string;

  @Field(() => [AddressModel], {
    description: 'Addresses associated with the person',
  })
  addresses: AddressModel[];

  @Field(() => [PhoneModel], {
    description: 'Phones associated with the person',
  })
  phones: PhoneModel[];

  @Field(() => [LegalDocModel], {
    description: 'Legal docs associated with the person',
  })
  legalDocs: LegalDocModel[];

  @Field(() => [SocialMediaModel], {
    description: 'Social medias associated with the person',
  })
  socialMedias: AddressModel[];
}
