import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionBodyDto } from './dtos/create-transaction-body.dto';
import { CreateTransactionSerializer } from './serializers/create-transactions.serializer';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private transactionsRepository: TransactionsRepository,
  ) {}

  async createTransaction(
    body: CreateTransactionBodyDto,
  ): Promise<CreateTransactionSerializer> {
    const account = new AccountEntity();
    account.accountId = body.accountId;

    const transaction = new TransactionEntity();
    transaction.account = account;
    transaction.amount = body.amount;
    transaction.type = body.type;

    let result = null;

    try {
      result = await this.transactionsRepository.insert(transaction);
    } catch (error) {
      if (error.message.startsWith('insert or update on table')) {
        throw new NotFoundException('account does not exists');
      } else {
        throw new BadGatewayException('some database error');
      }
    }

    await this.cacheService.del(`balance-acc-${body.accountId}`);

    return {
      transactionId: result.transactionId,
    } as CreateTransactionSerializer;
  }
}
