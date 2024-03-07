import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CountriesService } from '../countries/countries.service';
import { UsersService } from '../users/users.service';
import { CountryModel } from '../countries/models/country.model';
import { UserModel } from '../users/models/user.model';
import { LegalDocModel } from './models/legal-doc.model';
import { LegalDocsService } from './legal-docs.service';

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
  ) {
    return await this.legalDocsService.findOneById(legalDocId);
  }

  @ResolveField('country', () => CountryModel)
  async getCountry(@Parent() legalDoc: LegalDocModel) {
    return this.countriesService.findOneByCode(legalDoc.country.code);
  }

  @ResolveField('user', () => UserModel)
  async getUser(@Parent() legalDoc: LegalDocModel) {
    return this.usersService.findOneById(legalDoc.user.userId);
  }
}
