// src/app/api/users/[userId]/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "user:read");
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  return user;
});

export const PUT = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "user:update");
  const updatedData = await req.json();
  const updatedUser = await prisma.user.update({ where: { id: params.userId }, data: updatedData });
  return updatedUser;
});

export const DELETE = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "user:delete");
  await prisma.user.delete({ where: { id: params.userId } });
  return { message: "User deleted successfully" };
});
