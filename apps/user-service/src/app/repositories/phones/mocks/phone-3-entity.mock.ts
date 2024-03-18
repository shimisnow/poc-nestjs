import { PhoneTypeEnum } from '../../../database/enums/phone-type.enum';
import { CountryUsaEntityMock } from '../../countries/mocks';
import { UserTwoEntityMock } from '../../users/mocks';

export const PhoneThreeEntityMock = {
  phoneId: 3,
  type: PhoneTypeEnum.MAIN,
  number: 12345673,
  country: CountryUsaEntityMock,
  user: UserTwoEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
