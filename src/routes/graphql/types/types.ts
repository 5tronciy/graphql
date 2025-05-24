import { PrismaClient } from "@prisma/client";

export type GraphQLContext = {
  prisma: PrismaClient;
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