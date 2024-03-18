import { PhoneTypeEnum } from '../../../database/enums/phone-type.enum';
import { CountryUsaEntityMock } from '../../countries/mocks';
import { UserThreeEntityMock } from '../../users/mocks';

export const PhoneFourEntityMock = {
  phoneId: 4,
  type: PhoneTypeEnum.MAIN,
  number: 12345674,
  country: CountryUsaEntityMock,
  user: UserThreeEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
