import { PrismaClient, User } from "@prisma/client";
import DataLoader from "dataloader";

export function createLoaders(prisma: PrismaClient) {
  return {
    postsByAuthorId: new DataLoader(async (authorIds: readonly string[]) => {
      const posts = await prisma.post.findMany({
        where: {
          authorId: { in: [...authorIds] },
        },
      });
      const postsByUserId: { [key: string]: typeof posts } = {};
      for (const post of posts) {
        if (!postsByUserId[post.authorId]) {
          postsByUserId[post.authorId] = [];
        }
        postsByUserId[post.authorId].push(post);
      }
      return authorIds.map((id) => postsByUserId[id] || []);
    }),

    profileByUserId: new DataLoader(async (userIds: readonly string[]) => {
      const profiles = await prisma.profile.findMany({
        where: {
          userId: { in: [...userIds] },
        },
      });
      const map = Object.fromEntries(profiles.map(p => [p.userId, p]));
      return userIds.map(id => map[id] || null);
    }),

    memberTypeById: new DataLoader(async (typeIds: readonly string[]) => {
      const types = await prisma.memberType.findMany({
        where: {
          id: { in: [...typeIds] },
        },
      });
      const map = Object.fromEntries(types.map(mt => [mt.id, mt]));
      return typeIds.map(id => map[id] || null);
    }),

    userSubscribedToByUserId: new DataLoader(async (userIds: readonly string[]) => {
      const links = await prisma.subscribersOnAuthors.findMany({
        where: {
          subscriberId: { in: [...userIds] },
        },
        include: {
          author: true,
        },
      });

      const map: Record<string, User[]> = {};

      for (const link of links) {
        if (!map[link.subscriberId]) {
          map[link.subscriberId] = [];
        }
        map[link.subscriberId].push(link.author);
      }

      return userIds.map((id) => map[id] || []);
    }),

    subscribedToUserByUserId: new DataLoader(async (userIds: readonly string[]) => {
      const links = await prisma.subscribersOnAuthors.findMany({
        where: {
          authorId: { in: [...userIds] },
        },
        include: {
          subscriber: true,
        },
      });

      const map: Record<string, User[]> = {};

      for (const link of links) {
        if (!map[link.authorId]) {
          map[link.authorId] = [];
        }
        map[link.authorId].push(link.subscriber);
      }

      return userIds.map((id) => map[id] || []);
    }),
  };
}