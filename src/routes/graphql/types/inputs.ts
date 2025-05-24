import { 
  GraphQLBoolean, 
  GraphQLFloat, 
  GraphQLInputObjectType, 
  GraphQLInt, 
  GraphQLNonNull, 
  GraphQLObjectType, 
  GraphQLString 
} from "graphql";
import { UUIDType } from "./uuid.js";

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  description: 'Input for creating a new post',
  fields: {
    title: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the post (max 200 characters)'
    },
    content: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'The content of the post'
    },
    authorId: { 
      type: new GraphQLNonNull(UUIDType),
      description: 'The ID of the post author'
    },
  },
});

export const UpdatePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  description: 'Input for updating an existing post',
  fields: {
    title: { 
      type: GraphQLString,
      description: 'New title for the post (max 200 characters)'
    },
    content: { 
      type: GraphQLString,
      description: 'New content for the post'
    },
  },
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  description: 'Input for creating a new user',
  fields: {
    name: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'The user\'s name'
    },
    balance: { 
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The user\'s initial balance (must be non-negative)'
    },
  },
});

export const UpdateUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  description: 'Input for updating an existing user',
  fields: {
    name: { 
      type: GraphQLString,
      description: 'New name for the user'
    },
    balance: { 
      type: GraphQLFloat,
      description: 'New balance for the user (must be non-negative)'
    },
  },
});

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  description: 'Input for creating a new profile',
  fields: {
    userId: { 
      type: new GraphQLNonNull(UUIDType),
      description: 'The ID of the user this profile belongs to'
    },
    memberTypeId: { 
      type: new GraphQLNonNull(GraphQLString),
      description: 'The member type identifier'
    },
    yearOfBirth: { 
      type: GraphQLInt,
      description: 'The user\'s birth year (1900-current year)'
    },
    isMale: { 
      type: GraphQLBoolean,
      description: 'Whether the user is male'
    },
  },
});

export const UpdateProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  description: 'Input for updating an existing profile',
  fields: {
    memberTypeId: { 
      type: GraphQLString,
      description: 'New member type identifier'
    },
    yearOfBirth: { 
      type: GraphQLInt,
      description: 'New birth year (1900-current year)'
    },
    isMale: { 
      type: GraphQLBoolean,
      description: 'New gender specification'
    },
  },
});

export const MutationResponse = new GraphQLObjectType({
  name: 'MutationResponse',
  description: 'Standard response for mutations that don\'t return specific entities',
  fields: {
    success: { 
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the operation was successful'
    },
    message: { 
      type: GraphQLString,
      description: 'Additional information about the operation result'
    },
  },
});