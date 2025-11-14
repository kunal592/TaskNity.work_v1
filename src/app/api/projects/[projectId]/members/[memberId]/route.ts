// src/app/api/projects/[projectId]/members/[memberId]/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const PUT = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "project:member:update");
  const { roleInProject } = await req.json();
  if (!roleInProject) return new Response(JSON.stringify({ error: "Missing roleInProject" }), { status: 400 });

  const updated = await prisma.projectMember.update({
    where: { id: params.memberId },
    data: { roleInProject },
  });

  return updated;
});

export const DELETE = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "project:member:update");
  await prisma.projectMember.delete({ where: { id: params.memberId } });
  return { message: "Member removed" };
});
