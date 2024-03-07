import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalDocEntity } from '../../database/entities/legaldoc.entity';

@Injectable()
export class LegalDocsRepository {
  constructor(
    @InjectRepository(LegalDocEntity)
    private repository: Repository<LegalDocEntity>,
  ) {}

  async findOneById(legalDocId: number): Promise<LegalDocEntity | null> {
    return await this.repository.findOneBy({
      legalDocId,
    });
  }

  async findByUserId(userId: string): Promise<LegalDocEntity[]> {
    return await this.repository
      .createQueryBuilder()
      .select()
      .where('user_id = :userId', { userId })
      .getMany();
  }
}
