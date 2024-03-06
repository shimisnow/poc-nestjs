import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';

@Resolver((of) => UsersResolver)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query((returns) => UserModel, { name: 'user' })
  async getUser(
    @Args('userId', { type: () => String })
    userId: string,
  ) {
    return await this.usersService.findOneById(userId);
  }
}
