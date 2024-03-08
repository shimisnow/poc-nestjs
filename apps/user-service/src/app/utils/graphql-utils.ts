import { FieldNode, GraphQLResolveInfo } from 'graphql';

/**
 * Implements functions to help manipulate GraphQL requests
 */
export class GraphQLUtils {
  /**
   * Parses an GraphQLResolveInfo object and extract the
   * requested fields name from the GraphQL query
   *
   * @param {GraphQLResolveInfo} info GraphQL request info extracted with @Info() decorator
   * @returns {string[]} Field names
   */
  static extractQueryFields(info: GraphQLResolveInfo): string[] {
    return info.fieldNodes[0]?.selectionSet?.selections?.map(
      (field: FieldNode) => field.name.value,
    );
  }
}
