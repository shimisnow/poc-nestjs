import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private repository: Repository<TransactionEntity>,
  ) {}

  async findById(transactionId: number): Promise<TransactionEntity> {
    return await this.repository.findOne({
      where: {
        transactionId,
      },
    });
  }

  async insert(entity: TransactionEntity): Promise<TransactionEntity> {
    return await this.repository.save(entity);
  }
}
