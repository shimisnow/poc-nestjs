import { LegalDocEntity } from '../../database/entities/legaldoc.entity';

export class LegalDocsRepositoryMock {
  async findOneById(legalDocId: number): Promise<LegalDocEntity | null> {
    return;
  }

  async findByUserId(userId: string): Promise<LegalDocEntity[]> {
    return;
  }
}
