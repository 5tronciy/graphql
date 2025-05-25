import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { User } from './user.js';
import { Post } from './post.js';
import { Profile } from './profile.js';
import { MemberType, MemberTypeIdEnum } from './memberType.js';
import { GraphQLContext, UserWithSubscriptions } from '../types/types.js';
import { FieldsByTypeName, parseResolveInfo } from 'graphql-parse-resolve-info';
import { Prisma } from '@prisma/client';

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
      resolve: async (_, __, { prisma, loaders }, info) => {
        const parsedInfo = parseResolveInfo(info);
        const userFields = parsedInfo?.fieldsByTypeName?.User as FieldsByTypeName['User'];

        const needsUserSubscribedTo = 'userSubscribedTo' in userFields;
        const needsSubscribedToUser = 'subscribedToUser' in userFields;

        const include: Prisma.UserFindManyArgs['include'] = {};
        if (needsUserSubscribedTo) {
          include.userSubscribedTo = {
            include: { author: true },
          };
        }
        if (needsSubscribedToUser) {
          include.subscribedToUser = {
            include: { subscriber: true },
          };
        }

        const users: UserWithSubscriptions[] = await prisma.user.findMany({
          ...(Object.keys(include).length > 0 ? { include } : {}),
        });

        for (const user of users) {
          if (needsUserSubscribedTo && user.userSubscribedTo) {
            loaders.userSubscribedToByUserId.prime(
              user.id,
              user.userSubscribedTo.map(link => link.author),
            );
          }

          if (needsSubscribedToUser && user.subscribedToUser) {
            loaders.subscribedToUserByUserId.prime(
              user.id,
              user.subscribedToUser.map(link => link.subscriber),
            );
          }
        }

        return users;
      },
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