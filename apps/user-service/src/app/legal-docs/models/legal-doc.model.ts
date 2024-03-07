import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryModel } from '../../countries/models/country.model';
import { UserModel } from '../../users/models/user.model';
import { LegalDocTypeEnum } from '../../database/enums/legal-doc-type.enum';

registerEnumType(LegalDocTypeEnum, { name: 'LegalDocTypeEnum' });

@ObjectType({
  description: 'Legal doc information',
})
export class LegalDocModel {
  @Field(() => Int, { description: 'Unique identifier' })
  legalDocId: number;

  @Field(() => LegalDocTypeEnum, {
    description: 'Legal doc type as in BR-CNH, BR-RG',
  })
  type: LegalDocTypeEnum;

  @Field(() => String, { description: 'Legal doc identifier' })
  identifier: string;

  @Field(() => CountryModel, {
    description: 'Country associated with the legal doc',
  })
  country: CountryModel;

  @Field(() => UserModel, {
    description: 'User associated with the legal doc',
  })
  user: UserModel;
}
