import { GraphQLError } from "graphql";

export const validatePostInput = (dto: { title: string; content: string; authorId: string }) => {
  if (!dto.title.trim()) {
    throw new GraphQLError("Post title cannot be empty");
  }
  if (!dto.content.trim()) {
    throw new GraphQLError("Post content cannot be empty");
  }
  if (dto.title.length > 200) {
    throw new GraphQLError("Post title must be 200 characters or less");
  }
};

export const validateUserInput = (dto: { name: string; balance: number }) => {
  if (!dto.name.trim()) {
    throw new GraphQLError("User name cannot be empty");
  }
  if (dto.balance < 0) {
    throw new GraphQLError("User balance cannot be negative");
  }
};

export const validateProfileInput = (dto: { yearOfBirth?: number; memberTypeId?: string }) => {
  if (dto.yearOfBirth && (dto.yearOfBirth < 1900 || dto.yearOfBirth > new Date().getFullYear())) {
    throw new GraphQLError("Invalid year of birth");
  }
  if (dto.memberTypeId && !dto.memberTypeId.trim()) {
    throw new GraphQLError("Member type ID cannot be empty");
  }
};