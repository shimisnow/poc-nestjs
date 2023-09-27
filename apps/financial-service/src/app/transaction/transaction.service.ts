import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateTransactionBodyDto } from './dtos/create-transaction-body.dto';
import { CreateTransactionSerializer } from './serializers/create-transactions.serializer';
import { TransactionsRepository } from './repositories/transactions.repository';

@Injectable()
export class TransactionService {
  constructor(private transactionsRepository: TransactionsRepository) {}

  async createTransaction(
    body: CreateTransactionBodyDto
  ): Promise<CreateTransactionSerializer> {
    try {
      const result = await this.transactionsRepository.insert(body);

      if (result.identifiers.length > 0) {
        return {
          transactionId: result.identifiers[0].transactionId,
        } as CreateTransactionSerializer;
      }
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
