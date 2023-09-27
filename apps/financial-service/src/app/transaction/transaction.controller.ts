import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiBadGatewayResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTransactionBodyDto } from './dtos/create-transaction-body.dto';
import { CreateTransactionSerializer } from './serializers/create-transactions.serializer';
import { TransactionTypeEnum } from '@shared/database/enums/transaction-type.enum';
import { DefaultError500Serializer } from './serializers/default-error-500.serializer';
import { DefaultError502Serializer } from './serializers/default-error-502.serializer';
import { CreateTransactionError400Serializer } from './serializers/create-transaction-error-400.serializer';

@Controller('transaction')
@ApiTags('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a transaction',
    description: 'This endpoint receives only positive values. For debt operations, the value will be automatically inverted'
  })
  @ApiOkResponse({
    description: 'Information about the created transaction',
    type: CreateTransactionSerializer,
  })
  @ApiBadRequestResponse({
    description: 'Error validating request input data',
    type: CreateTransactionError400Serializer,
  })
  @ApiInternalServerErrorResponse({
    description:
      'The server has encountered a situation it does not know how to handle. See server logs for details',
    type: DefaultError500Serializer,
  })
  @ApiBadGatewayResponse({
    description: 'Internal data processing error. Probably a database error',
    type: DefaultError502Serializer,
  })
  async createTransaction(
    @Body() body: CreateTransactionBodyDto
  ): Promise<CreateTransactionSerializer> {
    if (body.type == TransactionTypeEnum.DEBT) {
      body.amount *= -1;
    }
    
    return await this.transactionService.createTransaction(body);
  }
}
