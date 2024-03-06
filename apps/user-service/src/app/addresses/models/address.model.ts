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
  @Field((type) => Int, { nullable: false })
  addressId: number;

  @Field((type) => String, { nullable: false })
  postalcode: string;

  @Field((type) => AddressTypeEnum, { nullable: false })
  type: AddressTypeEnum;

  @Field((type) => CountryModel, { nullable: false })
  country: CountryModel;

  @Field((type) => UserModel, { nullable: false })
  user: UserModel;
}
