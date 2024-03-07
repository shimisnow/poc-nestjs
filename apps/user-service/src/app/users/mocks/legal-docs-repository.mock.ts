import { LegalDocEntity } from '../../database/entities/legaldoc.entity';

/**
 * Mocks the legal docs repository to use in tests
 */
export class LegalDocsRepositoryMock {
  async findOneById(legalDocId: number): Promise<LegalDocEntity | null> {
    return;
  }

  async findByUserId(userId: string): Promise<LegalDocEntity[]> {
    return;
  }
}
