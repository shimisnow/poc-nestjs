import { GraphQLUtils } from './graphql-utils';

describe('graphql-utils', () => {
  describe('extractQueryFields()', () => {
    const generateGraphQLInfo = (fields) => {
      return {
        fieldNodes: [
          {
            selectionSet: {
              selections: fields.map((value) => {
                return {
                  name: {
                    value,
                  },
                };
              }),
            },
          },
        ],
      };
    };

    test('empty array', () => {
      const queryFields = [];

      const extractedQueryFields: string[] = GraphQLUtils.extractQueryFields(
        generateGraphQLInfo(queryFields) as any,
      );

      expect(extractedQueryFields.length).toBe(queryFields.length);
      expect(extractedQueryFields).toEqual(expect.arrayContaining(queryFields));
    });

    test('array with one item', () => {
      const queryFields = ['userId'];

      const extractedQueryFields: string[] = GraphQLUtils.extractQueryFields(
        generateGraphQLInfo(queryFields) as any,
      );

      expect(extractedQueryFields.length).toBe(queryFields.length);
      expect(extractedQueryFields).toEqual(expect.arrayContaining(queryFields));
    });

    test('array with multiple items', () => {
      const queryFields = ['userId', 'name', 'surname'];

      const extractedQueryFields: string[] = GraphQLUtils.extractQueryFields(
        generateGraphQLInfo(queryFields) as any,
      );

      expect(extractedQueryFields.length).toBe(queryFields.length);
      expect(extractedQueryFields).toEqual(expect.arrayContaining(queryFields));
    });

    test('invalid graphql info', () => {
      const extractedQueryFields: string[] = GraphQLUtils.extractQueryFields({
        fieldNodes: [
          {
            selectionSet: null,
          },
        ],
      } as any);

      expect(extractedQueryFields).toBeUndefined();
    });
  });
});
