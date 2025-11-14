// src/app/api/projects/[projectId]/members/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

/**
 * GET -> list members
 * POST -> add a member
 */
export const GET = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "project:read");
  const members = await prisma.projectMember.findMany({ where: { projectId: params.projectId } });
  return members;
});

export const POST = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "project:member:update");

  const { userId, roleInProject } = await req.json();
  if (!userId) return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });

  // create membership (unique constraint on projectId+userId)
  const member = await prisma.projectMember.create({
    data: { projectId: params.projectId, userId, roleInProject: roleInProject ?? "MEMBER" },
  });

  return member;
});
