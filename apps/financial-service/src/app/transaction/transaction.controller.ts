import {
  Body,
  Controller,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
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
import { DefaultError500Serializer } from './serializers/default-error-500.serializer';
import { DefaultError502Serializer } from './serializers/default-error-502.serializer';
import { CreateTransactionError400Serializer } from './serializers/create-transaction-error-400.serializer';
import { CreateTransactionError412Serializer } from './serializers/create-transaction-error-412.serializer';
import { AuthGuard } from '@shared/authentication/guards/auth.guard';
import { User } from '@shared/authentication/decorators/user.decorator';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { DefaultError401Serializer } from '@shared/authentication/serializers/default-error-401.serializer';
import { DefaultError403Serializer } from './serializers/default-error-403.serializer';

@Controller('transaction')
@ApiTags('transaction')
export class TransactionController {
  constructor(
    private transactionService: TransactionService,
  ) {}

  @Version('1')
  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Register a transaction',
    description:
      'This endpoint receives only positive values. For debt operations, the value will be automatically inverted',
  })
  @ApiHeader({
    name: 'X-Api-Version',
    description: 'Sets the API version',
    required: true,
  })
  @ApiOkResponse({
    description: 'Information about the created transaction',
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
    description: 'Error when the user has no access to the account or the account does not exist',
    type: DefaultError403Serializer,
  })
  @ApiPreconditionFailedResponse({
    description: 'Error when account has insufficient balance',
    type: CreateTransactionError412Serializer,
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
  // ignore on tests because this endpoint do not manipulate data
  /* istanbul ignore next */
  async createTransaction(
    @User() user: UserPayload,
    @Body() body: CreateTransactionBodyDto,
  ): Promise<CreateTransactionSerializer> {
    return await this.transactionService.createTransaction(user.userId, body);
  }
}
