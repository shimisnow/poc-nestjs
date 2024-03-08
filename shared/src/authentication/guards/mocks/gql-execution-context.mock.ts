import { ExecutionContext } from '@nestjs/common';

export class GqlExecutionContextMock {
  static create(context: ExecutionContext) {
    return {
      getContext: () => {
        return {
          req: context.switchToHttp().getRequest(),
        };
      },
    };
  }
}
