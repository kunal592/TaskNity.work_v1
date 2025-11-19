// src/app/api/admin/team/route.ts
import { withAuth } from "@/lib/withAuth";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

/**
 * Normalize role input from frontend to Prisma enum
 */
function normalizeRole(role?: string) {
  if (!role) return "MEMBER";
  const r = role.toString().toUpperCase();

  if (["ADMIN", "MANAGER", "VIEWER", "MEMBER"].includes(r)) return r;
  return "MEMBER";
}

// -----------------------------------------------------------
// GET — List all employees
// -----------------------------------------------------------
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
      salary: true,
      github: true,
      linkedin: true,
    },
  });

  const mapped = users.map((u) => ({
    id: u.id,
    clerkId: u.clerkId,
    email: u.email,
    name: u.name,
    role: u.role,
    joined: u.joinedAt?.toISOString().split("T")[0] ?? null,
    team: u.team ?? null,
    phone: u.phone,
    address: u.address,
    avatarUrl: u.avatarUrl,
    isActive: u.isActive,

    // Ensure safe types for frontend
    salary: u.salary ? Number(u.salary) : null,
    github: u.github ?? null,
    linkedin: u.linkedin ?? null,

    // Team page expects this field even if empty
    tasks: [],
  }));
console.log("API TEAM ROUTE RUNNING");

  return new Response(JSON.stringify({ users: mapped }), { status: 200 });
});

// -----------------------------------------------------------
// POST — Create new employee
// -----------------------------------------------------------
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
    joined,
    salary,
    github,
    linkedin,
  } = body ?? {};

  if (!email || !name || !role) {
    return new Response(
      JSON.stringify({ error: "Missing required fields (email, name, role)" }),
      { status: 400 }
    );
  }

  const normalizedRole = normalizeRole(role);

  // Create Clerk user (optional)
  let clerkUserId: string | undefined = undefined;
  try {
    const clerk = await clerkClient();
    const created = await clerk.users.createUser({
      emailAddress: [email],
      firstName: name,
      publicMetadata: { role: normalizedRole },
    });
    clerkUserId = created.id;
  } catch (e) {
    console.warn("Clerk user creation failed:", e);
  }

  // Build Prisma payload
  const createData: any = {
    clerkId: clerkUserId,
    email,
    name,
    role: normalizedRole,
    team: team ?? null,
    phone: phone ?? null,
    address: address ?? null,
    avatarUrl: avatarUrl ?? null,
    isActive: true,
    salary: salary ? Number(salary) : null,
    github: github ?? null,
    linkedin: linkedin ?? null,
  };

  // Optional joined date
  if (joined) {
    try {
      createData.joinedAt = new Date(joined);
    } catch (_e) {}
  }

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
      salary: true,
      github: true,
      linkedin: true,
    },
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
    salary: newUser.salary ? Number(newUser.salary) : null,
    github: newUser.github ?? null,
    linkedin: newUser.linkedin ?? null,
    tasks: [],
  };

  return new Response(JSON.stringify({ user: mapped }), { status: 201 });
});

// -----------------------------------------------------------
// DELETE — Remove user
// -----------------------------------------------------------
export const DELETE = withAuth(async (req: Request) => {
  await requirePermission(req, "user:delete");

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing id query parameter" }),
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  // Delete Clerk user if exists
  if (user.clerkId) {
    try {
      const clerk = await clerkClient();
      if (clerk.users && typeof clerk.users.deleteUser === "function") {
        await clerk.users.deleteUser(user.clerkId);
      }
    } catch (e) {
      console.warn("Failed to delete Clerk user:", e);
    }
  }

  await prisma.user.delete({ where: { id } });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
