import { Args, Query, Resolver } from '@nestjs/graphql';
import { CountryModel } from './models/country.model';
import { CountriesService } from './countries.service';
import { CountryCodeEnum } from '../database/enums/country-code.enum';
import { GraphQLQueryFields } from '../utils/decorators/graphql-query-fields.decorator';
import { UseGuards } from '@nestjs/common';
import { GraphQLAuthGuard } from '@shared/authentication/graphql';

@Resolver(() => CountryModel)
export class CountriesResolver {
  constructor(private countriesService: CountriesService) {}

  @Query(() => CountryModel, { name: 'country' })
  @UseGuards(GraphQLAuthGuard)
  async getCountry(
    @Args('code', { type: () => CountryCodeEnum })
    code: CountryCodeEnum,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return await this.countriesService.findOneByCode(code, queryFields);
  }
}
