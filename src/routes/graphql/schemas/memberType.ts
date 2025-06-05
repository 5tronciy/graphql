import { GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    PREMIUM: { value: 'BUSINESS' },
  },
});

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});