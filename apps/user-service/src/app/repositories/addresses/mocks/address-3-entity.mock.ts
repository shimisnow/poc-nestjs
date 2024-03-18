import { AddressTypeEnum } from '../../../database/enums/address-type.enum';
import { CountryUsaEntityMock } from '../../countries/mocks';
import { UserTwoEntityMock } from '../../users/mocks';

export const AddressThreeEntityMock = {
  addressId: 3,
  postalcode: '34567890',
  type: AddressTypeEnum.MAIN,
  country: CountryUsaEntityMock,
  user: UserTwoEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
