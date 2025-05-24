import { GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { Profile } from './profile.js';
import { Post } from './post.js';
import { GraphQLContext, UserParent, ProfileData, PostData, UserData } from '../types/types.js';

export const User: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: Profile,
      resolve: async (parent: UserParent, _, context: GraphQLContext): Promise<ProfileData | null> => {
        return await context.prisma.profile.findUnique({
          where: { userId: parent.id }
        });
      }
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: async (parent, _, { prisma }): Promise<PostData[] | null> => {
        return await prisma.post.findMany({ where: { authorId: parent.id } });
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(User),
      resolve: async (parent: UserParent, _, { prisma }: GraphQLContext): Promise<UserData[] | null> => {
        const subscriptions = await prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: { subscriberId: parent.id }
            }
          },
        });
        return subscriptions;
      }
    },
    subscribedToUser: {
      type: new GraphQLList(User),
      resolve: async (parent: UserParent, _, { prisma }: GraphQLContext): Promise<UserData[] | null> => {
        const subscriptions = await prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: { authorId: parent.id }
            }
          },
        });
        return subscriptions;
      }
    },
  }),
});