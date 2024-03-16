import { PhoneTypeEnum } from '../../../database/enums/phone-type.enum';
import { CountryBraEntityMock } from '../../countries/mocks';
import { UserOneEntityMock } from '../../users/mocks';

export const PhoneOneEntityMock = {
  phoneId: 1,
  type: PhoneTypeEnum.HOME,
  number: 12345671,
  country: CountryBraEntityMock,
  user: UserOneEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
