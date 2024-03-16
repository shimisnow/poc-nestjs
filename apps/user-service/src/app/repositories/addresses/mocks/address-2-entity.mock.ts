import { AddressTypeEnum } from '../../../database/enums/address-type.enum';
import { CountryBraEntityMock } from '../../countries/mocks';
import { UserOneEntityMock } from '../../users/mocks';

export const AddressTwoEntityMock = {
  addressId: 2,
  postalcode: '23456789',
  type: AddressTypeEnum.LEGAL,
  country: CountryBraEntityMock,
  user: UserOneEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
