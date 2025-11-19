// src/app/api/admin/team/route.ts
import { withAuth } from "@/lib/withAuth";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

/**
 * Helper to normalize role strings from frontend ("Admin", "Member", etc.)
 * to Prisma enum values (ADMIN, MANAGER, MEMBER, VIEWER)
 */
function normalizeRole(role?: string) {
  if (!role) return "MEMBER";
  const r = role.toString().toUpperCase();
  if (r === "ADMIN") return "ADMIN";
  if (r === "MANAGER") return "MANAGER";
  if (r === "VIEWER") return "VIEWER";
  return "MEMBER";
}

export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "user:read");

  const users = await prisma.user.findMany({
    orderBy: { joinedAt: "desc" },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      role: true,
      joinedAt: true,
      team: true,
      phone: true,
      address: true,
      avatarUrl: true,
      isActive: true,
    },
  });

  // Map DB fields to simpler frontend-friendly shape
  const mapped = users.map(u => ({
    id: u.id,
    clerkId: u.clerkId,
    email: u.email,
    name: u.name,
    role: u.role,
    joined: u.joinedAt?.toISOString().split("T")[0] ?? null,
    team: u.team,
    phone: u.phone,
    address: u.address,
    avatarUrl: u.avatarUrl,
    isActive: u.isActive,
  }));

  return new Response(JSON.stringify({ users: mapped }), { status: 200 });
});

export const POST = withAuth(async (req: Request) => {
  await requirePermission(req, "user:create");

  const body = await req.json();
  const {
    email,
    name,
    role,
    phone,
    address,
    team,
    avatarUrl,
    github,
    linkedin,
    joined,
  } = body ?? {};

  if (!email || !name || !role) {
    return new Response(JSON.stringify({ error: "Missing required fields (email, name, role)" }), { status: 400 });
  }

  // create clerk user (like existing /api/users route)
  let clerkUserId: string | undefined = undefined;
  try {
    const clerk = await (clerkClient as any)();
    if (clerk && clerk.users) {
      const created = await clerk.users.createUser({
        emailAddress: [email],
        firstName: name,
        publicMetadata: { role },
      });
      clerkUserId = created?.id;
    }
  } catch (e) {
    // don't fail completely if clerk create fails; still create DB user
    console.warn("Clerk user creation failed:", e);
  }

  // Normalize role to Prisma enum
  const normalizedRole = normalizeRole(role);

  // Build create payload (only fields that exist in Prisma User model)
  const createData: any = {
    clerkId: clerkUserId ?? undefined,
    email,
    name,
    role: normalizedRole,
    team: team ?? null,
    phone: phone ?? null,
    address: address ?? null,
    avatarUrl: avatarUrl ?? null,
    isActive: true,
  };

  if (joined) {
    try {
      createData.joinedAt = new Date(joined);
    } catch (e) {
      // ignore invalid date; fallback to now
    }
  }

  // Note: schema.prisma does not have `salary`, `github`, `linkedin` fields on User
  const newUser = await prisma.user.create({
    data: createData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      team: true,
      phone: true,
      address: true,
      avatarUrl: true,
      joinedAt: true,
    }
  });

  const mapped = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    team: newUser.team,
    phone: newUser.phone,
    address: newUser.address,
    avatarUrl: newUser.avatarUrl,
    joined: newUser.joinedAt?.toISOString().split("T")[0] ?? null,
  };

  return new Response(JSON.stringify({ user: mapped }), { status: 201 });
});

export const DELETE = withAuth(async (req: Request) => {
  await requirePermission(req, "user:delete");

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id query parameter" }), { status: 400 });
  }

  // fetch user to also remove clerk account if present
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  // attempt to delete Clerk user if linked
  if (user.clerkId) {
    try {
      const clerk = await (clerkClient as any)();
      if (clerk && clerk.users && typeof clerk.users.deleteUser === 'function') {
        await clerk.users.deleteUser(user.clerkId);
      }
    } catch (e) {
      console.warn("Failed to delete clerk user:", e);
    }
  }

  await prisma.user.delete({ where: { id } });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
