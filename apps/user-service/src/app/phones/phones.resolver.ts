import {
  Args,
  Info,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PhoneModel } from './models/phone.model';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { PhonesService } from './phones.service';
import { CountryModel } from '../countries/models/country.model';
import { UserModel } from '../users/models/user.model';
import { GraphQLResolveInfo } from 'graphql';
import { GraphQLUtils } from '../utils/graphql-utils';

@Resolver(() => PhoneModel)
export class PhonesResolver {
  constructor(
    private phonesService: PhonesService,
    private countriesService: CountriesService,
    private usersService: UsersService,
  ) {}

  @Query(() => PhoneModel, { name: 'phone' })
  async getPhone(
    @Args('phoneId', { type: () => Number })
    phoneId: number,
    @Info() info: GraphQLResolveInfo,
  ) {
    const queryFields: string[] = GraphQLUtils.extractQueryFields(info);

    return await this.phonesService.findOneById(phoneId, queryFields);
  }

  @ResolveField('country', () => CountryModel)
  async getCountry(
    @Parent() phone: PhoneModel,
    @Info() info: GraphQLResolveInfo,
  ) {
    const queryFields: string[] = GraphQLUtils.extractQueryFields(info);

    return this.countriesService.findOneByCode(phone.country.code, queryFields);
  }

  @ResolveField('user', () => UserModel)
  async getUser(@Parent() phone: PhoneModel, @Info() info: GraphQLResolveInfo) {
    const queryFields: string[] = GraphQLUtils.extractQueryFields(info);

    return this.usersService.findOneById(phone.user.userId, queryFields);
  }
}
