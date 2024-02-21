import {
  BadGatewayException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { CreateTransactionBodyDto } from './dtos/create-transaction-body.dto';
import { CreateTransactionSerializer } from './serializers/create-transactions.serializer';
import { TransactionsRepository } from './repositories/transactions/transactions.repository';
import { AccountsRepository } from './repositories/accounts/accounts.repository';
import { TransactionEntity } from '@shared/database/financial/entities/transaction.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AccountEntity } from '@shared/database/financial/entities/account.entity';
import { BalanceService } from '../balance/balance.service';
import { TransactionTypeEnum } from '@shared/database/financial/enums/transaction-type.enum';
import { UserService } from '../user/user.service';
import { CacheKeyPrefix } from '@shared/cache/enums/cache-key-prefix.enum';
import { CreatePairTransactionResult } from './repositories/transactions/create-pair-transaction.result';

@Injectable()
export class TransactionService {
  /** ignore */
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheService: Cache,
    private accountsRepository: AccountsRepository,
    private transactionsRepository: TransactionsRepository,
    private balanceService: BalanceService,
  ) {}

  /**
   * Create a pair debit/credit transaction
   * 
   * @param userId User that must be the owner of the account from the debit transaction
   * @param body Transaction information
   * @returns Performed transactions id
   * @throws PreconditionFailedException only debit transaction type allowed
   * @throws ForbiddenException account does not exists or it is inactive
   * @throws PreconditionFailedException insufficient account balance
   */
  async createDebitTransaction(
    userId: string,
    body: CreateTransactionBodyDto,
  ): Promise<CreateTransactionSerializer> {
    if (body.type != TransactionTypeEnum.DEBIT) {
      throw new PreconditionFailedException({
        statusCode: 412,
        message: 'PreconditionFailed',
        data: {
          name: 'InvalidTransactionType',
          errors: ['only debit transaction type allowed'],
        }
      });
    }

    // verify if both accounts exists AND is active
    const accountExists = await Promise.all([
      this.accountsRepository.accountExists(body.accountId, true),
      this.accountsRepository.accountExists(body.pairAccountId, true),
    ]);

    const errorMessages = [];

    // verify the main account
    if(accountExists[0] === false) {
      errorMessages.push('accountId does not exists or it is inactive');
    }

    // verify the destination account
    if(accountExists[1] === false) {
      errorMessages.push('pairAccountId does not exists or it is inactive');
    }

    if(errorMessages.length > 0) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Forbidden',
        data: {
          name: 'InexistentOrInactiveAccount',
          errors: errorMessages,
        }
      });
    }

    if (body.amount > 0) {
      body.amount *= -1;
    }

    // it is not necessary to verify if user has access to the account
    // because this function already does it
    const balance = await this.balanceService.getBalanceIgnoringCache(
      body.accountId,
      userId,
    );

    // using + because amount will be a negative number
    if (balance + body.amount < 0) {
      throw new PreconditionFailedException({
        statusCode: 412,
        message: 'PreconditionFailed',
        data: {
          name: 'InsufficientAccountBalance',
        }
      });
    }

    // create the transactions into database
    const transactions: CreatePairTransactionResult = await this.transactionsRepository.createPairTransaction({
      from: {
        accountId: body.accountId,
        type: TransactionTypeEnum.DEBIT,
        amount: body.amount,
      },
      to: {
        accountId: body.pairAccountId,
        type: TransactionTypeEnum.CREDIT,
        amount: (body.amount * -1),
      },
    });

    await this.cacheService.del([
      CacheKeyPrefix.FINANCIAL_BALANCE,
      body.accountId,
    ].join(':'));

    await this.cacheService.del([
      CacheKeyPrefix.FINANCIAL_BALANCE,
      body.pairAccountId,
    ].join(':'));

    return transactions as CreateTransactionSerializer;
  }
}
