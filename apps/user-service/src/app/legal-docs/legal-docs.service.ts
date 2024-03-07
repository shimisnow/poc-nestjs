import { Injectable } from '@nestjs/common';
import { LegalDocsRepository } from '../repositories/legal-docs/legal-docs.repository';
import { LegalDocEntity } from '../database/entities/legaldoc.entity';

@Injectable()
export class LegalDocsService {
  constructor(private legalDocsRepository: LegalDocsRepository) {}

  async findOneById(legalDocId: number): Promise<LegalDocEntity | null> {
    return await this.legalDocsRepository.findOneById(legalDocId);
  }

  async findByUserId(userId: string): Promise<LegalDocEntity[]> {
    return await this.legalDocsRepository.findByUserId(userId);
  }
}
