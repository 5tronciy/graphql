import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { MemberType } from './memberType.js';
import { GraphQLContext, MemberTypeData, ProfileParent } from '../types/types.js';

export const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: MemberType,
      resolve: async (
        parent: ProfileParent,
        _args,
        { loaders }: GraphQLContext
      ): Promise<MemberTypeData | null> => {
        return loaders.memberTypeById.load(parent.memberTypeId);
      },
    },
  }),
});