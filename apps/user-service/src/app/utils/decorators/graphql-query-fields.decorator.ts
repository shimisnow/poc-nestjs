import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FieldNode } from 'graphql';

/**
 * Extracts the requested fields at the GraphQL query and return it as a arrary of strings
 */
export const GraphQLQueryFields = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(ctx);

    const requestedFields: string[] = gqlContext
      .getInfo()
      .fieldNodes[0]?.selectionSet?.selections?.map((field: FieldNode) => {
        return field.name.value;
      });

    return requestedFields;
  },
);
