import { Type } from '@fastify/type-provider-typebox';
import {
  buildSchema,
  graphql,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';

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

const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

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
  },
});

const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  },
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: userType,
    },
    memberTypes: {
      type: memberType,
    },
    posts: {
      type: postType,
    },
    profiles: {
      type: profileType,
    },

    user: {
      type: userType,
      args: {
        id: { type: UUIDType },
      },
    },
    memberType: {
      type: memberType,
      args: {
        id: { type: memberTypeId },
      },
    },
    post: {
      type: postType,
      args: {
        id: { type: UUIDType },
      },
    },
    profile: {
      type: profileType,
      args: {
        id: { type: UUIDType },
      },
    },
  },
});

export const gqlSchema = new GraphQLSchema({ query: queryType });
