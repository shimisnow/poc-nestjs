import { Injectable } from '@nestjs/common';
import { LegalDocsRepository } from '../repositories/legal-docs/legal-docs.repository';
import { LegalDocEntity } from '../database/entities/legaldoc.entity';

@Injectable()
export class LegalDocsService {
  constructor(private legalDocsRepository: LegalDocsRepository) {}

  async findOneById(
    legalDocId: number,
    queryFields: string[] = null,
  ): Promise<LegalDocEntity | null> {
    return await this.legalDocsRepository.findOneById(
      legalDocId,
      queryFields as [keyof LegalDocEntity],
    );
  }

  async findOneByIdWithUserId(
    legalDocId: number,
    userId: string,
    queryFields: string[] = null,
  ): Promise<LegalDocEntity | null> {
    return await this.legalDocsRepository.findOneByIdWithUserId(
      legalDocId,
      userId,
      queryFields as [keyof LegalDocEntity],
    );
  }

  async findByUserId(
    userId: string,
    queryFields: string[] = null,
  ): Promise<LegalDocEntity[]> {
    return await this.legalDocsRepository.findByUserId(
      userId,
      queryFields as [keyof LegalDocEntity],
    );
  }
}
