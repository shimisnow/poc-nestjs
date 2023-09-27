import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private repository: Repository<TransactionEntity>
  ) {}

  async findById(transactionId: number): Promise<TransactionEntity> {
    return await this.repository.findOne({
      where: {
        transactionId,
      },
    });
  }

  async insert(entity: TransactionEntity): Promise<InsertResult> {
    return await this.repository.insert(entity);
  }
}
