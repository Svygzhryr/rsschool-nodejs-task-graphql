/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';
import { IPostDto, IProfileDto, IUserDto } from './types/dtos.js';

const memberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

const memberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: memberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  },
});

const postType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  },
});

const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: memberType },
    memberType: {
      type: memberType,
      resolve: async (
        { memberTypeId }: { memberTypeId: MemberTypeId },
        _,
        prisma: PrismaClient,
      ) => await prisma.memberType.findUnique({ where: { id: memberTypeId } }),
    },
  },
});

const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: profileType,
      resolve: async ({ id }: { id: string }, _, prisma: PrismaClient) =>
        await prisma.profile.findUnique({ where: { userId: id } }),
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: async ({ id }, __, prisma: PrismaClient) =>
        await prisma.post.findMany({
          where: {
            authorId: id,
          },
        }),
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: async ({ id }, __, prisma: PrismaClient) =>
        await prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: id,
              },
            },
          },
        }),
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: async ({ id }, __, prisma: PrismaClient) =>
        await prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: id,
              },
            },
          },
        }),
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
      resolve: async (_, __, prisma: PrismaClient) => await prisma.user.findMany(),
    },
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(memberType))),
      resolve: async (_, __, prisma: PrismaClient) => await prisma.memberType.findMany(),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType))),
      resolve: async (_, __, prisma: PrismaClient) => await prisma.post.findMany(),
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(profileType))),
      resolve: async (_, __, prisma: PrismaClient) => await prisma.profile.findMany(),
    },

    user: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, prisma: PrismaClient) =>
        await prisma.user.findUnique({
          where: {
            id,
          },
        }),
    },
    memberType: {
      type: memberType,
      args: {
        id: { type: new GraphQLNonNull(memberTypeId) },
      },
      resolve: async (_, { id }: { id: MemberTypeId }, prisma: PrismaClient) =>
        await prisma.memberType.findUnique({
          where: {
            id,
          },
        }),
    },
    post: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, prisma: PrismaClient) =>
        await prisma.post.findUnique({
          where: {
            id,
          },
        }),
    },
    profile: {
      type: profileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, prisma: PrismaClient) =>
        await prisma.profile.findUnique({
          where: {
            id,
          },
        }),
    },
  },
});

const postDto = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  },
});

const userDto = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

const profileDto = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    userId: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: memberTypeId },
  },
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost: {
      type: postType,
      args: {
        dto: { type: new GraphQLNonNull(postDto) },
      },
      resolve: async (_, { dto: data }: { dto: IPostDto }, prisma: PrismaClient) =>
        await prisma.post.create({ data }),
    },
    createUser: {
      type: userType,
      args: {
        dto: { type: new GraphQLNonNull(userDto) },
      },
      resolve: async (_, { dto: data }: { dto: IUserDto }, prisma: PrismaClient) =>
        await prisma.user.create({ data }),
    },
    createProfile: {
      type: profileType,
      args: {
        dto: { type: new GraphQLNonNull(profileDto) },
      },
      resolve: async (_, { dto: data }: { dto: IProfileDto }, prisma: PrismaClient) =>
        await prisma.profile.create({ data }),
    },
    deletePost: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, prisma: PrismaClient) =>
        await prisma.post.delete({ where: { id } }),
    },
    deleteUser: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, prisma: PrismaClient) =>
        await prisma.user.delete({ where: { id } }),
    },
    deleteProfile: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, prisma: PrismaClient) =>
        await prisma.profile.delete({ where: { id } }),
    },
  },
});

export const gqlSchema = new GraphQLSchema({ query: queryType, mutation: mutationType });
