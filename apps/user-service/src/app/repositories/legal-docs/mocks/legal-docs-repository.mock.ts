import { LegalDocEntity } from '../../../database/entities/legaldoc.entity';
import {
  LegalDocOneEntityMock,
  LegalDocTwoEntityMock,
  LegalDocThreeEntityMock,
  LegalDocFourEntityMock,
} from '.';

/**
 * Mocks the legal docs repository to use in tests
 */
export class LegalDocsRepositoryMock {
  legalDocs = [
    LegalDocOneEntityMock,
    LegalDocTwoEntityMock,
    LegalDocThreeEntityMock,
    LegalDocFourEntityMock,
  ];

  async findOneById(
    legalDocId: number,
    queryFields: [keyof LegalDocEntity] = null,
  ): Promise<LegalDocEntity | null> {
    return this.legalDocs.find((value) => (value.legalDocId = legalDocId));
  }

  async findOneByIdWithUserId(
    legalDocId: number,
    userId: string,
    queryFields: [keyof LegalDocEntity] = null,
  ): Promise<LegalDocEntity | null> {
    return this.legalDocs.find((value) => {
      return value.legalDocId == legalDocId && value.user.userId == userId;
    });
  }

  async findByUserId(
    userId: string,
    queryFields: [keyof LegalDocEntity] = null,
  ): Promise<LegalDocEntity[]> {
    return this.legalDocs.filter((value) => value.user.userId == userId);
  }
}
