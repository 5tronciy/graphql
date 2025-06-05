import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createLoaders } from './loaders.js';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const document = parse(req.body.query);

      const validationErrors = validate(schema, document, [depthLimit(5)]);

      if (validationErrors.length > 0) {
        return {
          errors: validationErrors,
        };
      }

      return graphql(
        {
          schema,
          source: req.body.query,
          variableValues: req.body.variables,
          contextValue: { prisma, loaders: createLoaders(prisma) }
        }
      );
    },
  });
};

export default plugin;