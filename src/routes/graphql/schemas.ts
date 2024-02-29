import { Type } from '@fastify/type-provider-typebox';
import { buildSchema } from 'graphql';

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

export const resourcesSchema = buildSchema(`
  type Query {
    memberTypes: [MemberType]
    users: [User]
    posts: [Post]
    profiles: [Profile]

    memberType(memberTypeId: ID): [MemberType]
    user(userId: ID): [User]
    post(postId: ID): [Post]
    profile(profileId: ID): [Profile]
  }

  type MemberType {
    id: ID
    discount: Float
    postsLimitPerMonth: Int
  }

  type User {
    id: ID
    name: String
    balance: Float
  }

  type Post {
    id: ID
    title: String
    content: String
  }

  type Profile {
    id: ID
    isMale: Boolean
    yearOfBirth: Int  
  }
`);
