import { Field, ObjectType } from '@nestjs/graphql';
import { AddressModel } from '../../addresses/models/address.model';

@ObjectType({
  description: '',
})
export class UserModel {
  @Field((type) => String)
  userId: string;

  @Field((type) => String)
  name: string;

  @Field((type) => String)
  surname: string;

  @Field((type) => String)
  email: string;

  @Field((type) => [AddressModel])
  addresses: AddressModel[];
}
