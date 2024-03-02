import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { gqlSchema } from './mySchemas.js';
import { graphql } from 'graphql';

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
      const response = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: fastify.prisma,
      }).then((response) => {
        const { data, errors } = response;
        return { data, errors };
      });

      return response;
    },
  });
};

export default plugin;
