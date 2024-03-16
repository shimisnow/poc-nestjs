import { AddressTypeEnum } from '../../../database/enums/address-type.enum';
import { CountryBraEntityMock } from '../../countries/mocks';
import { UserOneEntityMock } from '../../users/mocks';

export const AddressOneEntityMock = {
  addressId: 1,
  postalcode: '12345678',
  type: AddressTypeEnum.MAIN,
  country: CountryBraEntityMock,
  user: UserOneEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
