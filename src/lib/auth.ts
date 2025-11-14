// src/lib/auth.ts
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./db";

/**
 * Ensures user is authenticated and synced in DB.
 */
export async function requireAuth() {
  const clerk = await currentUser();

  if (!clerk) {
    throw new Error("UNAUTHORIZED");
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: clerk.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerk.id,
        email: clerk.emailAddresses?.[0]?.emailAddress || "",
        name: `${clerk.firstName || ""} ${clerk.lastName || ""}`,
        avatarUrl: clerk.imageUrl,
        role: "VIEWER",
      },
    });
  }

  return user;
}

/**
 * Ensures user has the required role(s)
 */
export async function requireRole(allowed: string[]) {
  const user = await requireAuth();

  if (!allowed.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
