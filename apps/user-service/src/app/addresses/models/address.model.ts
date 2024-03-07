import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AddressTypeEnum } from '../../database/enums/address-type.enum';
import { CountryModel } from '../../countries/models/country.model';
import { UserModel } from '../../users/models/user.model';

registerEnumType(AddressTypeEnum, { name: 'AddressTypeEnum' });

/**
 * Address information
 */
@ObjectType({
  description: '',
})
export class AddressModel {
  /**
   * Unique identifier
   */
  @Field(() => Int, { description: 'Unique identifier' })
  addressId: number;

  /**
   * Postal code
   */
  @Field(() => String, { description: 'Postal code' })
  postalcode: string;

  /**
   * Address type as in work, home
   */
  @Field(() => AddressTypeEnum, {
    description: 'Address type as in work, home',
  })
  type: AddressTypeEnum;

  /**
   * Country associated with the address
   */
  @Field(() => CountryModel, {
    description: 'Country associated with the address',
  })
  country: CountryModel;

  /**
   * User associated with the address
   */
  @Field(() => UserModel, {
    description: 'User associated with the address',
  })
  user: UserModel;
}
