import {
  Args,
  Info,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { CountryModel } from '../countries/models/country.model';
import { UserModel } from '../users/models/user.model';
import { LegalDocModel } from './models/legal-doc.model';
import { LegalDocsService } from './legal-docs.service';
import { GraphQLResolveInfo } from 'graphql';
import { GraphQLUtils } from '../utils/graphql-utils';

@Resolver(() => LegalDocModel)
export class LegalDocsResolver {
  constructor(
    private legalDocsService: LegalDocsService,
    private countriesService: CountriesService,
    private usersService: UsersService,
  ) {}

  @Query(() => LegalDocModel, { name: 'legaldocs' })
  async getLegalDoc(
    @Args('legalDocId', { type: () => Number })
    legalDocId: number,
    @Info() info: GraphQLResolveInfo,
  ) {
    const queryFields: string[] = GraphQLUtils.extractQueryFields(info);

    return await this.legalDocsService.findOneById(legalDocId, queryFields);
  }

  @ResolveField('country', () => CountryModel)
  async getCountry(
    @Parent() legalDoc: LegalDocModel,
    @Info() info: GraphQLResolveInfo,
  ) {
    const queryFields: string[] = GraphQLUtils.extractQueryFields(info);

    return this.countriesService.findOneByCode(
      legalDoc.country.code,
      queryFields,
    );
  }

  @ResolveField('user', () => UserModel)
  async getUser(
    @Parent() legalDoc: LegalDocModel,
    @Info() info: GraphQLResolveInfo,
  ) {
    const queryFields: string[] = GraphQLUtils.extractQueryFields(info);

    return this.usersService.findOneById(legalDoc.user.userId, queryFields);
  }
}
