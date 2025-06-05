import { Type } from '@fastify/type-provider-typebox';
import { RootQuery } from './schemas/rootQuery.js';
import { GraphQLSchema } from 'graphql';
import { Mutation } from './schemas/mutation.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});