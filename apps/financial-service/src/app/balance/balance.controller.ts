import { Controller, Get, Query } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { GetBalanceQueryDto } from './dtos/get-balance-query.dto';
import { GetBalanceSerializer } from './serializers/get-balance.serializer';
import { ApiBadGatewayResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetBalanceError400Serializer } from './serializers/get-balance-error-400.serializer';
import { DefaultError500Serializer } from './serializers/default-error-500.serializer';
import { DefaultError502Serializer } from './serializers/default-error-502.serializer';

@Controller('balance')
@ApiTags('balance')
export class BalanceController {
  constructor(private balanceService: BalanceService) {}

  @Get()
  @ApiOperation({
    summary:
      'Retrieves information from a given account',
  })
  @ApiOkResponse({
    description: 'Information about the account balance',
    type: GetBalanceSerializer,
  })
  @ApiBadRequestResponse({
    description: 'Error validating request input data',
    type: GetBalanceError400Serializer,
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
  async getBalance(
    @Query() query: GetBalanceQueryDto
  ): Promise<GetBalanceSerializer> {
    const balance = await this.balanceService.getBalance(query.accountId);

    return {
      balance,
    } as GetBalanceSerializer;
  }
}
