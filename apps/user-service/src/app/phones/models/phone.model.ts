import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';
import { AddressTypeEnum } from '../../database/enums/address-type.enum';
import { CountryModel } from '../../countries/models/country.model';
import { UserModel } from '../../users/models/user.model';
import { PhoneTypeEnum } from '../../database/enums/phone-type.enum';

registerEnumType(PhoneTypeEnum, { name: 'PhoneTypeEnum' });
registerEnumType(CountryCodeEnum, { name: 'CountryCodeEnum' });

/**
 * Phone information
 */
@ObjectType({
  description: 'Phone information',
})
export class PhoneModel {
  /**
   * Unique identifier
   */
  @Field(() => Int, { description: 'Unique identifier' })
  phoneId: number;

  /**
   * Phone type as in main, home, work
   */
  @Field(() => PhoneTypeEnum, {
    description: 'Phone type as in main, home, work',
  })
  type: AddressTypeEnum;

  /**
   * Phone number
   */
  @Field(() => Number, { description: 'Phone number' })
  number: number;

  /**
   * Country associated with the phone
   */
  @Field(() => CountryModel, {
    description: 'Country associated with the phone',
  })
  country: CountryModel;

  /**
   * User associated with the phone
   */
  @Field(() => UserModel, { description: 'User associated with the phone' })
  user: UserModel;
}
