import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';

registerEnumType(CountryCodeEnum, { name: 'CountryCodeEnum' });

@ObjectType({
  description: 'Country information',
})
export class CountryModel {
  @Field(() => CountryCodeEnum, {
    description: 'Country code as ISO 3166-1 Alfa 3',
  })
  countryCode: CountryCodeEnum;

  @Field(() => Int, { description: 'Country calling code' })
  countryCallingCode: number;
}
