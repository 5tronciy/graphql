import { GraphQLError } from "graphql";

export const handleMutationError = (error: unknown, operation: string): never => {
  if (error instanceof Error) {
    console.error(`Error in ${operation}:`, error);
    throw new GraphQLError(`Failed to ${operation}: ${error.message}`);
  }

  console.error(`Unknown error in ${operation}:`, error);
  throw new GraphQLError(`Failed to ${operation}: An unknown error occurred`);
};