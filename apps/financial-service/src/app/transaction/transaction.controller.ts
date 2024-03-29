import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPreconditionFailedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateTransactionBodyDto } from './dtos/create-transaction-body.dto';
import { CreateTransactionSerializer } from './serializers/create-transactions.serializer';
import { CreateTransactionError400Serializer } from './serializers/create-transaction-error-400.serializer';
import { CreateTransactionError412Serializer } from './serializers/create-transaction-error-412.serializer';
import { AuthGuard } from '@shared/authentication/guards/auth.guard';
import { User } from '@shared/authentication/decorators/user.decorator';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { DefaultError401Serializer } from '@shared/authentication/serializers/default-error-401.serializer';
import { CreateTransactionError403Serializer } from './serializers/create-transaction-error-403.serializer';
import { CreateTransactionError500Serializer } from './serializers/create-transaction-error-500.serializer';
import { CreateTransactionError502Serializer } from './serializers/create-transaction-error-502.serializer';

@Controller('transaction')
@ApiTags('transaction')
@ApiBearerAuth('AccessToken')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Version('1')
  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a debit transaction',
    description:
      'This endpoint receives only positive values. The value will be automatically inverted. Only debt operations are allowed',
  })
  @ApiHeader({
    name: 'X-Api-Version',
    description: 'Sets the API version',
    required: true,
  })
  @ApiOkResponse({
    description: 'Information about the created transactions',
    type: CreateTransactionSerializer,
  })
  @ApiBadRequestResponse({
    description: 'Error validating request input data',
    type: CreateTransactionError400Serializer,
  })
  @ApiUnauthorizedResponse({
    description: 'Error when unauthorized',
    type: DefaultError401Serializer,
  })
  @ApiForbiddenResponse({
    description:
      'Error when the user has no access to the account or the account does not exist',
    type: CreateTransactionError403Serializer,
  })
  @ApiPreconditionFailedResponse({
    description: 'Error when account has insufficient balance',
    type: CreateTransactionError412Serializer,
  })
  @ApiInternalServerErrorResponse({
    description:
      'The server has encountered a situation it does not know how to handle. See server logs for details',
    type: CreateTransactionError500Serializer,
  })
  @ApiBadGatewayResponse({
    description: 'Internal data processing error. Probably a database error',
    type: CreateTransactionError502Serializer,
  })
  // ignore on tests because this endpoint do not manipulate data
  /* istanbul ignore next */
  async createTransaction(
    @User() user: UserPayload,
    @Body() body: CreateTransactionBodyDto,
  ): Promise<CreateTransactionSerializer> {
    return await this.transactionService.createDebitTransaction(
      user.userId,
      body,
    );
  }
}
