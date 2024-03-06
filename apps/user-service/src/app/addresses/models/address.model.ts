import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';
import { AddressTypeEnum } from '../../database/enums/address-type.enum';
import { CountryModel } from '../../countries/models/country.model';
import { UserModel } from '../../users/models/user.model';

registerEnumType(AddressTypeEnum, { name: 'AddressTypeEnum' });
registerEnumType(CountryCodeEnum, { name: 'CountryCodeEnum' });

@ObjectType({
  description: 'Address information',
})
export class AddressModel {
  @Field(() => Int, { description: 'Unique identifier' })
  addressId: number;

  @Field(() => String, { description: 'Postal code' })
  postalcode: string;

  @Field(() => AddressTypeEnum, {
    description: 'Address type as in work, home',
  })
  type: AddressTypeEnum;

  @Field(() => CountryModel, {
    description: 'Country associated with the address',
  })
  country: CountryModel;

  @Field(() => UserModel, {
    description: 'User associated with the address',
  })
  user: UserModel;
}
