import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { User } from './user.js';
import { Post } from './post.js';
import { Profile } from './profile.js';
import { MemberType, MemberTypeIdEnum } from './memberType.js';
import { GraphQLContext } from '../types/types.js';

export const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, { id }: { id: string }, { prisma }: GraphQLContext) =>
        prisma.user.findUnique({ where: { id } }),
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: (_, __, { prisma }) =>
        prisma.user.findMany(),
    },
    post: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, { id }: { id: string }, { prisma }) =>
        prisma.post.findUnique({ where: { id } }),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: (_, __, { prisma }) =>
        prisma.post.findMany(),
    },
    profile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (_, { id }: { id: string }, { prisma }) =>
        prisma.profile.findUnique({ where: { id } }),
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
      resolve: (_, __, { prisma }) =>
        prisma.profile.findMany(),
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      },
      resolve: (_, { id }: { id: string }, { prisma }) =>
        prisma.memberType.findUnique({ where: { id } }),
    },
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: (_, __, { prisma }) =>
        prisma.memberType.findMany(),
    },
  },
});