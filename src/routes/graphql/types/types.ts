import { MemberType, Post, PrismaClient, Profile, User } from "@prisma/client";
import DataLoader from "dataloader";

interface Loaders {
  postsByAuthorId: DataLoader<string, Post[]>;
  profileByUserId: DataLoader<string, Profile | null>;
  memberTypeById: DataLoader<string, MemberType | null>;
  userSubscribedToByUserId: DataLoader<string, User[]>;
  subscribedToUserByUserId: DataLoader<string, User[]>;
}

export type GraphQLContext = {
  prisma: PrismaClient;
  loaders: Loaders;
};

export type ProfileParent = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
};

export interface ProfileData {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

export interface MemberTypeData {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
}

export interface UserData {
  id: string;
  name: string;
  balance: number;
}

export interface PostData {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export type UserParent = {
  id: string;
  name: string;
  balance: number;
};