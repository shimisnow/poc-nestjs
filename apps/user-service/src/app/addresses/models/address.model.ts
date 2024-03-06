import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';
import { AddressTypeEnum } from '../../database/enums/address-type.enum';
import { CountryModel } from '../../countries/models/country.model';
import { UserModel } from '../../users/models/user.model';

registerEnumType(AddressTypeEnum, { name: 'AddressTypeEnum' });
registerEnumType(CountryCodeEnum, { name: 'CountryCodeEnum' });

@ObjectType({
  description: '',
})
export class AddressModel {
  @Field((type) => Int)
  addressId: number;

  @Field((type) => String)
  postalcode: string;

  @Field((type) => AddressTypeEnum)
  type: AddressTypeEnum;

  @Field((type) => CountryModel)
  country: CountryModel;

  @Field((type) => UserModel)
  user: UserModel;
}
