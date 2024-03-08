import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { CountryModel } from './models/country.model';
import { CountriesService } from './countries.service';
import { CountryCodeEnum } from '../database/enums/country-code.enum';
import { GraphQLResolveInfo } from 'graphql';
import { GraphQLUtils } from '../utils/graphql-utils';

@Resolver(() => CountryModel)
export class CountriesResolver {
  constructor(private countriesService: CountriesService) {}

  @Query(() => CountryModel, { name: 'country' })
  async getCountry(
    @Args('code', { type: () => CountryCodeEnum })
    code: CountryCodeEnum,
    @Info() info: GraphQLResolveInfo,
  ) {
    const queryFields: string[] = GraphQLUtils.extractQueryFields(info);

    return await this.countriesService.findOneByCode(code, queryFields);
  }
}
