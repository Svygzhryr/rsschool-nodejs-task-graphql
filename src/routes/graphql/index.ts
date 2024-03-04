import depthLimit from 'graphql-depth-limit';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { GraphQLArgs, Source, graphql, parse, validate } from 'graphql';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { gqlSchema } from './mySchemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
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
      const schema = gqlSchema;
      const { query, variables } = req.body;
      const ast = parse(new Source(query, 'General.graphql'));
      const isQueryTooDeep = validate(schema, ast, [depthLimit(5)]);
      const response = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: fastify.prisma,
      });
      const { data, errors } = response;
      return { data, errors: isQueryTooDeep || errors };
    },
  });
};

export default plugin;
