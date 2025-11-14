// src/lib/getCurrentDbUser.ts
import { auth, getAuth } from "@clerk/nextjs/server";
import { prisma } from "./db";

/**
 * Resolve current DB user by Clerk userId.
 * Accepts optional Request so it can use getAuth(req) (sync) when available.
 */
export async function getCurrentDbUser(req?: Request) {
  let clerkUserId: string | undefined | null = undefined;

  try {
    // try sync getAuth(req) first (works in edge/server handlers that pass req)
    // @ts-ignore
    const ga = getAuth ? getAuth(req as any) : undefined;
    clerkUserId = ga?.userId;
  } catch (e) {
    /* ignore */
  }

  try {
    if (!clerkUserId) {
      // fallback to async auth()
      // @ts-ignore
      const a = await auth();
      clerkUserId = a?.userId;
    }
  } catch (e) {
    /* ignore */
  }

  if (!clerkUserId) return null;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  return dbUser;
}
