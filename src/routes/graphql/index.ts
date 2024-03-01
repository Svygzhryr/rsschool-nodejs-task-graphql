import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { gqlSchema, createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';

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
      const schema = gqlSchema;
      const source = req.body.query;
      const variables = req.body?.variables;
      const rootValue = {
        posts: () => prisma.post.findMany(),
        users: () => prisma.user.findMany(),
        memberTypes: () => prisma.memberType.findMany(),
        profiles: () => prisma.profile.findMany(),

        post: () =>
          prisma.post.findUnique({
            where: {
              id: variables?.postId as string,
            },
          }),

        user: () =>
          prisma.user.findUnique({
            where: {
              id: variables?.userId as string,
            },
          }),

        memberType: async () => {
          console.log('>>>>>>>> MEMTYPE', variables?.memberTypeId);
          const response = await prisma.memberType.findUnique({
            where: {
              id: variables?.memberTypeId as string,
            },
          });
          return response;
        },

        profile: () =>
          prisma.profile.findUnique({
            where: {
              id: variables?.profileId as string,
            },
          }),
      };

      const response = await graphql({ source, schema, rootValue }).then((response) => {
        const { data, errors } = response;
        return { data, errors };
      });

      return response;
    },
  });
};

export default plugin;
