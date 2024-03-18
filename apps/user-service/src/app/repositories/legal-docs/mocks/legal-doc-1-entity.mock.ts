import { LegalDocTypeEnum } from '../../../database/enums/legal-doc-type.enum';
import { CountryBraEntityMock } from '../../countries/mocks';
import { UserOneEntityMock } from '../../users/mocks';

export const LegalDocOneEntityMock = {
  legalDocId: 1,
  type: LegalDocTypeEnum.BRA_CNH,
  identifier: '123456789-1',
  country: CountryBraEntityMock,
  user: UserOneEntityMock,
  createdAt: new Date(),
  updatedAt: new Date(),
};
