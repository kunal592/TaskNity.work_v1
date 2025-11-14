// src/app/api/auth/me/route.ts
import { withAuth } from "@/lib/withAuth";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * This route continues to auto-sync Clerk -> Prisma.
 * It returns the Prisma user record.
 */
export const GET = withAuth(async (req: Request) => {
  const clerk = await currentUser();
  const clerkId = clerk?.id;
  if (!clerkId) {
    // no session
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: clerk.emailAddresses?.[0]?.emailAddress || "",
        name: `${clerk.firstName || ""} ${clerk.lastName || ""}`.trim() || null,
        avatarUrl: clerk.imageUrl || null,
        role: "VIEWER", // default role
        isActive: true,
      },
    });
  }

  return user;
});
