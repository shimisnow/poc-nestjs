import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from './auth.guard';

@Injectable()
export class GraphQLAuthGuard extends AuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const context = GqlExecutionContext.create(ctx);
    const { req } = context.getContext();
    const token = this.extractTokenFromHeader(req);

    req['user'] = await this.extractPayloadFromJwtToken(token);

    return true;
  }
}
