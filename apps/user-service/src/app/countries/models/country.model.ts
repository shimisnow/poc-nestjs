import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';

registerEnumType(CountryCodeEnum, { name: 'CountryCodeEnum' });

/**
 * Country information
 */
@ObjectType({
  description: 'Country information',
})
export class CountryModel {
  /**
   * Country code as ISO 3166-1 Alfa 3
   */
  @Field(() => CountryCodeEnum, {
    description: 'Country code as ISO 3166-1 Alfa 3',
  })
  code: CountryCodeEnum;

  /**
   * Country calling code
   */
  @Field(() => Int, { description: 'Country calling code' })
  callingCode: number;
}
