import { LegalDocTypeEnum } from '../../../database/enums/legal-doc-type.enum';
import { CountryUsaEntityMock } from '../../countries/mocks';
import { UserTwoEntityMock } from '../../users/mocks';

export const LegalDocThreeEntityMock = {
  legalDocId: 3,
  type: LegalDocTypeEnum.USA_SSN,
  identifier: '123456789-3',
  country: CountryUsaEntityMock,
  user: UserTwoEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
