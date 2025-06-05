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
      resolve: async (parent: UserParent, _, { loaders }: GraphQLContext): Promise<ProfileData | null> => {
        return loaders.profileByUserId.load(parent.id);
      }
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: async (parent, _, { loaders }: GraphQLContext): Promise<PostData[] | null> => {
        return loaders.postsByAuthorId.load(parent.id);
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(User),
      resolve: async (parent: UserParent, _, { loaders }: GraphQLContext): Promise<UserData[] | null> => {
        return loaders.userSubscribedToByUserId.load(parent.id);
      }
    },
    subscribedToUser: {
      type: new GraphQLList(User),
      resolve: async (parent: UserParent, _, { loaders }: GraphQLContext): Promise<UserData[] | null> => {
        return loaders.subscribedToUserByUserId.load(parent.id);
      }
    },
  }),
});