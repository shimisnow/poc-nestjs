import { Controller, Get, Query } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { GetBalanceQueryDto } from './dtos/get-balance-query.dto';
import { GetBalanceSerializer } from './serializers/get-balance.serializer';

@Controller('balance')
export class BalanceController {
  constructor(private balanceService: BalanceService) {}

  @Get()
  async getBalance(
    @Query() query: GetBalanceQueryDto
  ): Promise<GetBalanceSerializer> {
    const balance = await this.balanceService.getBalance(query.accountId);

    return {
      balance,
    } as GetBalanceSerializer;
  }
}
