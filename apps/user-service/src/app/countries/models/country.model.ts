import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';

registerEnumType(CountryCodeEnum, { name: 'CountryCodeEnum' });

@ObjectType({
  description: '',
})
export class CountryModel {
  @Field(() => CountryCodeEnum)
  countryCode: CountryCodeEnum;

  @Field((type) => Int)
  countryCallingCode: number;
}
