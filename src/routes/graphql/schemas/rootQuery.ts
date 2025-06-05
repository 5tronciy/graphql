import { User as UserType } from '@prisma/client';
import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { FieldsByTypeName, parseResolveInfo } from 'graphql-parse-resolve-info';
import { MemberType, MemberTypeIdEnum } from './memberType.js';
import { Post } from './post.js';
import { Profile } from './profile.js';
import { GraphQLContext } from '../types/types.js';
import { UUIDType } from '../types/uuid.js';
import { User } from './user.js';

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

        const users = await prisma.user.findMany({
          include: {
            userSubscribedTo: needsUserSubscribedTo,
            subscribedToUser: needsSubscribedToUser,
          },
        });

        if (needsUserSubscribedTo) {
          const subscriberToAuthorsMap: Record<string, UserType[]> = {};

          for (const user of users) {
            subscriberToAuthorsMap[user.id] = user.userSubscribedTo
              .map((subscription) => {
                const authorId = subscription.authorId;
                return users.find((author) => author.id === authorId);
              })
              .filter((author): author is NonNullable<typeof author> => author !== undefined)
              .map((author) => ({
                id: author.id,
                name: author.name,
                balance: author.balance,
              }));
          }

          for (const [subscriberId, authors] of Object.entries(subscriberToAuthorsMap)) {
            loaders.userSubscribedToByUserId.prime(subscriberId, authors);
          }
        }


        if (needsSubscribedToUser) {
          const authorToSubscribersMap: Record<string, Array<{ id: string; name: string; balance: number; }>> = {};

          for (const user of users) {
            authorToSubscribersMap[user.id] = user.subscribedToUser
              .map((subscription) => {
                const subscriberId = subscription.subscriberId;
                return users.find((subscriber) => subscriber.id === subscriberId);
              })
              .filter((subscriber): subscriber is NonNullable<typeof subscriber> => subscriber !== undefined)
              .map((subscriber) => ({
                id: subscriber.id,
                name: subscriber.name,
                balance: subscriber.balance,
              }));
          }

          for (const [authorId, subscribers] of Object.entries(authorToSubscribersMap)) {
            loaders.subscribedToUserByUserId.prime(authorId, subscribers);
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