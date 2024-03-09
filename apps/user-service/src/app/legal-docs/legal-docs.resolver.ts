import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { CountryModel } from '../countries/models/country.model';
import { UserModel } from '../users/models/user.model';
import { LegalDocModel } from './models/legal-doc.model';
import { LegalDocsService } from './legal-docs.service';
import { GraphQLQueryFields } from '../utils/decorators/graphql-query-fields.decorator';

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
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return await this.legalDocsService.findOneById(legalDocId, queryFields);
  }

  @ResolveField('country', () => CountryModel)
  async getCountry(
    @Parent() legalDoc: LegalDocModel,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return this.countriesService.findOneByCode(
      legalDoc.country.code,
      queryFields,
    );
  }

  @ResolveField('user', () => UserModel)
  async getUser(
    @Parent() legalDoc: LegalDocModel,
    @GraphQLQueryFields() queryFields: string[],
  ) {
    return this.usersService.findOneById(legalDoc.user.userId, queryFields);
  }
}
