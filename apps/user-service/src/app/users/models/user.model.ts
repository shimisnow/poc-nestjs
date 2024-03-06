import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: '',
})
export class UserModel {
  @Field((type) => String, { nullable: false })
  userId: string;

  @Field((type) => String, { nullable: false })
  name: string;

  @Field((type) => String, { nullable: false })
  surname: string;

  @Field((type) => String, { nullable: false })
  email: string;
}
