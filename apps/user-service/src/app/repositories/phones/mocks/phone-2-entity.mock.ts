import { PhoneTypeEnum } from '../../../database/enums/phone-type.enum';
import { CountryBraEntityMock } from '../../countries/mocks';
import { UserOneEntityMock } from '../../users/mocks';

export const PhoneTwoEntityMock = {
  phoneId: 2,
  type: PhoneTypeEnum.WORK,
  number: 12345672,
  country: CountryBraEntityMock,
  user: UserOneEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
