import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { CreateTransactionBodyDto } from './dtos/create-transaction-body.dto';
import { CreateTransactionSerializer } from './serializers/create-transactions.serializer';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';
import { BalanceService } from '../balance/balance.service';
import { TransactionTypeEnum } from '@shared/database/financial/enums/transaction-type.enum';

@Injectable()
export class TransactionService {
  /** ignore */
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private transactionsRepository: TransactionsRepository,
    private balanceService: BalanceService,
  ) {}

  /**
   * Register a transaction into database.
   * This function deletes the account balance cache
   *
   * @param body Transaction information
   * @returns Information about the created transaction
   * @throws BadGatewayException database error
   * @throws NotFoundException account does not exists
   * @throws PreconditionFailedException insufficient account balance
   */
  async createTransaction(
    body: CreateTransactionBodyDto,
  ): Promise<CreateTransactionSerializer> {
    if (body.type == TransactionTypeEnum.DEBIT) {
      const balance = await this.balanceService.getBalanceIgnoringCache(
        body.accountId,
      );
      // using + because amount will be a negative number
      if (balance + body.amount < 0) {
        throw new PreconditionFailedException('insufficient account balance');
      }
    }

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
