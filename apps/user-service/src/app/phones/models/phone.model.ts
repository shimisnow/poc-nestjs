import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';
import { AddressTypeEnum } from '../../database/enums/address-type.enum';
import { CountryModel } from '../../countries/models/country.model';
import { UserModel } from '../../users/models/user.model';
import { PhoneTypeEnum } from '../../database/enums/phone-type.enum';

registerEnumType(PhoneTypeEnum, { name: 'PhoneTypeEnum' });
registerEnumType(CountryCodeEnum, { name: 'CountryCodeEnum' });

@ObjectType({
  description: 'Phone information',
})
export class PhoneModel {
  @Field(() => Int, { description: 'Unique identifier' })
  phoneId: number;

  @Field(() => PhoneTypeEnum, {
    description: 'Phone type as in main, home, work',
  })
  type: AddressTypeEnum;

  @Field(() => Number, { description: 'Phone number' })
  number: number;

  @Field(() => CountryModel, {
    description: 'Country associated with the phone',
  })
  country: CountryModel;

  @Field(() => UserModel, { description: 'User associated with the phone' })
  user: UserModel;
}
