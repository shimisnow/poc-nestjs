import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateTransactionBodyDto } from './dtos/create-transaction-body.dto';
import { CreateTransactionSerializer } from './serializers/create-transactions.serializer';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async createTransaction(
    body: CreateTransactionBodyDto
  ): Promise<CreateTransactionSerializer> {
    try {
      const result = await this.transactionsRepository.insert(
        body as TransactionEntity
      );

      return {
        transactionId: result.transactionId,
      } as CreateTransactionSerializer;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
