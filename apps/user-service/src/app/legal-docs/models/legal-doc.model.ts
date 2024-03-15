import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryModel } from '../../countries/models/country.model';
import { UserModel } from '../../users/models/user.model';
import { LegalDocTypeEnum } from '../../database/enums/legal-doc-type.enum';

registerEnumType(LegalDocTypeEnum, { name: 'LegalDocTypeEnum' });

/**
 * Legal doc information
 */
@ObjectType({
  description: 'Legal doc information',
})
export class LegalDocModel {
  /**
   * Unique identifier
   */
  @Field(() => Int, { description: 'Unique identifier' })
  legalDocId: number;

  /**
   * Legal doc type as in BR_CNH, BR_RG
   */
  @Field(() => LegalDocTypeEnum, {
    description: 'Legal doc type as in BR_CNH, BR_RG',
  })
  type: LegalDocTypeEnum;

  /**
   * Legal doc identifier
   */
  @Field(() => String, { description: 'Legal doc identifier' })
  identifier: string;

  /**
   * Country associated with the legal doc
   */
  @Field(() => CountryModel, {
    description: 'Country associated with the legal doc',
  })
  country: CountryModel;

  /**
   * User associated with the legal doc
   */
  @Field(() => UserModel, {
    description: 'User associated with the legal doc',
  })
  user: UserModel;
}
