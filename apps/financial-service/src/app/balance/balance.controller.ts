import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { GetBalanceQueryDto } from './dtos/get-balance-query.dto';
import { GetBalanceSerializer } from './serializers/get-balance.serializer';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@shared/authentication//guards/auth.guard';
import { User } from '@shared/authentication/decorators/user.decorator';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { GetBalanceError400Serializer } from './serializers/get-balance-error-400.serializer';
import { DefaultError500Serializer } from './serializers/default-error-500.serializer';
import { DefaultError502Serializer } from './serializers/default-error-502.serializer';
import { GetBalanceError404Serializer } from './serializers/get-balance-error-404.serializer';
import { DefaultError401Serializer } from './serializers/default-error-401.serializer';
import { DefaultError403Serializer } from './serializers/default-error-403.serializer';
import { UserService } from '../user/user.service';

@Controller('balance')
@ApiTags('balance')
export class BalanceController {
  constructor(
    private balanceService: BalanceService,
    private userService: UserService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Retrieves information from a given account',
  })
  @ApiOkResponse({
    description: 'Information about the account balance',
    type: GetBalanceSerializer,
  })
  @ApiBadRequestResponse({
    description: 'Error validating request input data',
    type: GetBalanceError400Serializer,
  })
  @ApiUnauthorizedResponse({
    description: 'Error when unauthorized',
    type: DefaultError401Serializer,
  })
  @ApiForbiddenResponse({
    description: 'Error when the user has no access to the account',
    type: DefaultError403Serializer,
  })
  @ApiNotFoundResponse({
    description: 'Error when the account does not exist',
    type: GetBalanceError404Serializer,
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
    @User() user: UserPayload,
    @Query() query: GetBalanceQueryDto,
  ): Promise<GetBalanceSerializer> {
    const hasAccess = await this.userService.hasAccessToAccount(
      user.userId,
      query.accountId,
    );

    if (hasAccess == false) {
      throw new ForbiddenException();
    }

    const balanceResult = await this.balanceService.getBalance(query.accountId);

    return balanceResult;
  }
}
