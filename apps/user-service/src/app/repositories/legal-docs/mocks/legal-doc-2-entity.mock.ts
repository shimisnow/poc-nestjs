import { LegalDocTypeEnum } from '../../../database/enums/legal-doc-type.enum';
import { CountryBraEntityMock } from '../../countries/mocks';
import { UserOneEntityMock } from '../../users/mocks';

export const LegalDocTwoEntityMock = {
  legalDocId: 2,
  type: LegalDocTypeEnum.BRA_RG,
  identifier: '123456789-2',
  country: CountryBraEntityMock,
  user: UserOneEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
