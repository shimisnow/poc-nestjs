import { LegalDocTypeEnum } from '../../../database/enums/legal-doc-type.enum';
import { CountryUsaEntityMock } from '../../countries/mocks';
import { UserThreeEntityMock } from '../../users/mocks';

export const LegalDocFourEntityMock = {
  legalDocId: 4,
  type: LegalDocTypeEnum.USA_SSN,
  identifier: '123456789-4',
  country: CountryUsaEntityMock,
  user: UserThreeEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
