import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CountryCodeEnum } from '../../database/enums/country-code.enum';

registerEnumType(CountryCodeEnum, { name: 'CountryCodeEnum' });

@ObjectType({
  description: '',
})
export class Country {
  @Field(() => CountryCodeEnum, { nullable: false })
  countryCode: CountryCodeEnum;

  @Field((type) => Int, { nullable: false })
  countryCallingCode: number;
}
