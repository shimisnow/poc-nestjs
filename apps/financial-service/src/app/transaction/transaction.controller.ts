import { Body, Controller, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionBodyDto } from './dtos/create-transaction-body.dto';
import { CreateTransactionSerializer } from './serializers/create-transactions.serializer';
import { TransactionTypeEnum } from '@shared/database/enums/transaction-type.enum';

@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Body() body: CreateTransactionBodyDto
  ): Promise<CreateTransactionSerializer> {
    if (body.type == TransactionTypeEnum.DEBT) {
      body.amount *= -1;
    }
    
    return await this.transactionService.createTransaction(body);
  }
}
