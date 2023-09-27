import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { CreateTransactionBodyDto } from './dtos/create-transaction-body.dto';
import { CreateTransactionSerializer } from './serializers/create-transactions.serializer';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionEntity } from '@shared/database/entities/transaction.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private transactionsRepository: TransactionsRepository,
  ) {}

  async createTransaction(
    body: CreateTransactionBodyDto,
  ): Promise<CreateTransactionSerializer> {
    try {
      const result = await this.transactionsRepository.insert(
        body as TransactionEntity,
      );

      await this.cacheService.del(`balance-acc-${body.accountId}`);

      return {
        transactionId: result.transactionId,
      } as CreateTransactionSerializer;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
