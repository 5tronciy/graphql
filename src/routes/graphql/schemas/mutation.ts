import { GraphQLBoolean, GraphQLError, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { Post } from "./post.js";
import { GraphQLContext } from "../types/types.js";
import { User } from "./user.js";
import { Profile } from "./profile.js";
import { UUIDType } from "../types/uuid.js";
import { CreatePostInput, CreateProfileInput, CreateUserInput, UpdatePostInput, UpdateProfileInput, UpdateUserInput } from "../types/inputs.js";
import { handleMutationError } from "../helpers/handleError.js";
import { validatePostInput, validateProfileInput, validateUserInput } from "../helpers/validate.js";

export const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost: {
      type: Post,
      description: 'Create a new post',
      args: {
        dto: {
          type: new GraphQLNonNull(CreatePostInput),
        },
      },
      resolve: async (_, { dto }: { dto: { title: string; content: string; authorId: string } }, { prisma }: GraphQLContext) => {
        try {
          validatePostInput(dto);

          const author = await prisma.user.findUnique({
            where: { id: dto.authorId }
          });

          if (!author) {
            throw new GraphQLError("Author not found");
          }

          return await prisma.post.create({
            data: {
              title: dto.title,
              content: dto.content,
              authorId: dto.authorId,
            },
          });
        } catch (error) {
          handleMutationError(error, 'create post');
        }
      },
    },
    createUser: {
      type: User,
      description: 'Create a new user',
      args: {
        dto: {
          type: new GraphQLNonNull(CreateUserInput),
        },
      },
      resolve: async (
        _,
        { dto }: { dto: { name: string; balance: number } },
        { prisma }: GraphQLContext
      ) => {
        try {
          validateUserInput(dto);

          return prisma.user.create({
            data: {
              name: dto.name,
              balance: dto.balance,
            },
          });
        } catch (error) {
          handleMutationError(error, 'create user');
        }
      },
    },
    createProfile: {
      type: Profile,
      description: 'Create a new profile for a user',
      args: {
        dto: {
          type: new GraphQLNonNull(CreateProfileInput),
        },
      },
      resolve: async (
        _,
        { dto }: { dto: { userId: string; memberTypeId: string; yearOfBirth: number; isMale: boolean } },
        { prisma }: GraphQLContext
      ) => {
        try {
          validateProfileInput(dto);

          const user = await prisma.user.findUnique({
            where: { id: dto.userId }
          });

          if (!user) {
            throw new GraphQLError("User not found");
          }

          const existingProfile = await prisma.profile.findFirst({
            where: { userId: dto.userId }
          });

          if (existingProfile) {
            throw new GraphQLError("Profile already exists for this user");
          }

          return await prisma.profile.create({
            data: {
              userId: dto.userId,
              memberTypeId: dto.memberTypeId,
              yearOfBirth: dto.yearOfBirth,
              isMale: dto.isMale,
            },
          });
        } catch (error) {
          handleMutationError(error, 'create profile');
        }
      },
    },
    deletePost: {
      type: GraphQLBoolean,
      description: 'Delete a post',
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: GraphQLContext) => {
        try {
          const existingPost = await prisma.post.findUnique({
            where: { id }
          });

          if (!existingPost) {
            return {
              success: false,
              message: "Post not found"
            };
          }

          await prisma.post.delete({
            where: { id },
          });

          return true;
        } catch (error) {
          handleMutationError(error, 'delete post');
          return false;
        }
      },
    },

    deleteUser: {
      type: GraphQLBoolean,
      description: 'Delete a user and their related data',
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: GraphQLContext) => {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { id }
          });

          if (!existingUser) {
            return {
              success: false,
              message: "User not found"
            };
          }

          await prisma.$transaction(async (tx) => {
            await tx.post.deleteMany({
              where: { authorId: id }
            });

            await tx.profile.deleteMany({
              where: { userId: id }
            });

            await tx.subscribersOnAuthors.deleteMany({
              where: {
                OR: [
                  { subscriberId: id },
                  { authorId: id }
                ]
              }
            });

            await tx.user.delete({
              where: { id }
            });
          });

          return true;
        } catch (error) {
          handleMutationError(error, 'delete user');
          return false;
        }
      },
    },

    deleteProfile: {
      type: GraphQLBoolean,
      description: 'Delete a profile',
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: GraphQLContext) => {
        try {
          const existingProfile = await prisma.profile.findUnique({
            where: { id }
          });

          if (!existingProfile) {
            return {
              success: false,
              message: "Profile not found"
            };
          }

          await prisma.profile.delete({
            where: { id },
          });

          return true;
        } catch (error) {
          handleMutationError(error, 'delete profile');
          return false;
        }
      },
    },

    changePost: {
      type: Post,
      description: 'Update an existing post',
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(UpdatePostInput),
        },
      },
      resolve: async (
        _,
        { id, dto }: { id: string; dto: { title?: string; content?: string } },
        { prisma }: GraphQLContext
      ) => {
        try {
          const existingPost = await prisma.post.findUnique({
            where: { id }
          });

          if (!existingPost) {
            throw new GraphQLError("Post not found");
          }

          const updateData: { title?: string; content?: string } = {};

          if (dto.title !== undefined) {
            if (!dto.title.trim()) {
              throw new GraphQLError("Post title cannot be empty");
            }
            updateData.title = dto.title.trim();
          }

          if (dto.content !== undefined) {
            if (!dto.content.trim()) {
              throw new GraphQLError("Post content cannot be empty");
            }
            updateData.content = dto.content.trim();
          }

          if (Object.keys(updateData).length === 0) {
            throw new GraphQLError("No valid fields provided for update");
          }

          return await prisma.post.update({
            where: { id },
            data: updateData,
          });
        } catch (error) {
          handleMutationError(error, 'update post');
        }
      },
    },

    changeUser: {
      type: User,
      description: 'Update an existing user',
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(UpdateUserInput),
        },
      },
      resolve: async (
        _,
        { id, dto }: { id: string; dto: { name?: string; balance?: number } },
        { prisma }: GraphQLContext
      ) => {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { id }
          });

          if (!existingUser) {
            throw new GraphQLError("User not found");
          }

          const updateData: { name?: string; balance?: number } = {};

          if (dto.name !== undefined) {
            if (!dto.name.trim()) {
              throw new GraphQLError("User name cannot be empty");
            }
            updateData.name = dto.name.trim();
          }

          if (dto.balance !== undefined) {
            if (dto.balance < 0) {
              throw new GraphQLError("User balance cannot be negative");
            }
            updateData.balance = dto.balance;
          }

          if (Object.keys(updateData).length === 0) {
            throw new GraphQLError("No valid fields provided for update");
          }

          return await prisma.user.update({
            where: { id },
            data: updateData,
          });
        } catch (error) {
          handleMutationError(error, 'update user');
        }
      },
    },

    changeProfile: {
      type: Profile,
      description: 'Update an existing profile',
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(UpdateProfileInput),
        },
      },
      resolve: async (
        _,
        { id, dto }: { id: string; dto: { userId?: string; memberTypeId?: string; yearOfBirth?: number; isMale?: boolean } },
        { prisma }: GraphQLContext
      ) => {
        try {
          const existingProfile = await prisma.profile.findUnique({
            where: { id }
          });

          if (!existingProfile) {
            throw new GraphQLError("Profile not found");
          }

          validateProfileInput(dto);

          const updateData: { memberTypeId?: string; yearOfBirth?: number; isMale?: boolean } = {};

          if (dto.memberTypeId !== undefined) updateData.memberTypeId = dto.memberTypeId;
          if (dto.yearOfBirth !== undefined) updateData.yearOfBirth = dto.yearOfBirth;
          if (dto.isMale !== undefined) updateData.isMale = dto.isMale;

          if (Object.keys(updateData).length === 0) {
            throw new GraphQLError("No valid fields provided for update");
          }

          return await prisma.profile.update({
            where: { id },
            data: updateData,
          });
        } catch (error) {
          handleMutationError(error, 'update profile');
        }
      },
    },

    subscribeTo: {
      type: GraphQLBoolean,
      description: 'Subscribe a user to an author',
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma }: GraphQLContext
      ) => {
        try {
          if (userId === authorId) {
            return {
              success: false,
              message: "Users cannot subscribe to themselves"
            };
          }
          const [user, author] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.user.findUnique({ where: { id: authorId } })
          ]);

          if (!user) {
            return {
              success: false,
              message: "Subscriber not found"
            };
          }

          if (!author) {
            return {
              success: false,
              message: "Author not found"
            };
          }

          const existingSubscription = await prisma.subscribersOnAuthors.findUnique({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId,
              },
            },
          });

          if (existingSubscription) {
            return {
              success: false,
              message: "Already subscribed to this author"
            };
          }

          await prisma.subscribersOnAuthors.create({
            data: {
              subscriberId: userId,
              authorId,
            },
          });

          return true;
        } catch (error) {
          handleMutationError(error, 'subscribe to');
          return false;
        }
      },
    },

    unsubscribeFrom: {
      type: GraphQLBoolean,
      description: 'Unsubscribe a user from an author',
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma }: GraphQLContext
      ) => {
        try {
          const existingSubscription = await prisma.subscribersOnAuthors.findUnique({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId,
              },
            },
          });

          if (!existingSubscription) {
            return {
              success: false,
              message: "Subscription not found"
            };
          }

          await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId,
              },
            },
          });

          return true;
        } catch (error) {
          handleMutationError(error, 'unsubscribe from');
          return false;
        }
      },
    },
  },
});