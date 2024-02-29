import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  resourcesSchema,
  createGqlResponseSchema,
  gqlResponseSchema,
} from './schemas.js';
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
      const schema = resourcesSchema;
      const source = req.body.query;
      const rootValue = {
        posts: () => prisma.post.findMany(),
        users: () => prisma.user.findMany(),
        memberTypes: () => prisma.memberType.findMany(),
        profiles: () => prisma.profile.findMany(),

        post: ({ postId }: { postId: string }) =>
          prisma.post.findUnique({
            where: {
              id: postId,
            },
          }),

        user: ({ userId }) =>
          prisma.post.findUnique({
            where: {
              id: userId as string,
            },
          }),

        memberType: ({ memberTypeId }) =>
          prisma.memberType.findUnique({
            where: {
              id: memberTypeId as string,
            },
          }),

        profile: ({ profileId }) =>
          prisma.profile.findUnique({
            where: {
              id: profileId as string,
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
