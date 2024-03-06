import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';
import { AddressTypeEnum } from '../../database/enums/address-type.enum';
import { CountryModel } from '../../countries/models/country.model';
import { UserModel } from '../../users/models/user.model';
import { PhoneTypeEnum } from '../../database/enums/phone-type.enum';

registerEnumType(PhoneTypeEnum, { name: 'PhoneTypeEnum' });
registerEnumType(CountryCodeEnum, { name: 'CountryCodeEnum' });

@ObjectType({
  description: '',
})
export class PhoneModel {
  @Field((type) => Int)
  phoneId: number;

  @Field((type) => PhoneTypeEnum)
  type: AddressTypeEnum;

  @Field((type) => Number)
  number: number;

  @Field((type) => CountryModel)
  country: CountryModel;

  @Field((type) => UserModel)
  user: UserModel;
}
