// src/app/api/users/route.ts
import { withAuth } from "@/lib/withAuth";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "user:read");
  const users = await prisma.user.findMany({
    select: { id: true, clerkId: true, email: true, name: true, role: true, joinedAt: true, team: true },
  });
  return { users };
});

export const POST = withAuth(async (req: Request) => {
  await requirePermission(req, "user:create");
  const body = await req.json();
  const { email, name, role, position, department, team } = body ?? {};

  if (!email || !name || !role) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.createUser({
    emailAddress: [email],
    firstName: name,
    publicMetadata: { role },
  });

  const newUser = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      name,
      role,
      team: team ?? null,
    },
  });

  return newUser;
});
