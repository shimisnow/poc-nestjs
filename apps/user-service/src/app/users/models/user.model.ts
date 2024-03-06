import { Field, ObjectType } from '@nestjs/graphql';
import { AddressModel } from '../../addresses/models/address.model';

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
}
