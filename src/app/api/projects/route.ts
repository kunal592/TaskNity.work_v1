// src/app/api/projects/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "project:read");

  const projects = await prisma.project.findMany({
    include: {
      lead: { select: { id: true, name: true, email: true, role: true } },
      members: { select: { id: true, userId: true, roleInProject: true } },
    },
  });

  return { projects };
});

export const POST = withAuth(async (req: Request) => {
  await requirePermission(req, "project:create");
  const body = await req.json();
  const { name, description, leadId, startDate, endDate, status } = body ?? {};

  if (!name) return new Response(JSON.stringify({ error: "Missing required fields: name" }), { status: 400 });

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  const newProject = await prisma.project.create({
    data: {
      name,
      description: description ?? null,
      leadId: leadId ?? null,
      startDate: start ?? undefined,
      endDate: end ?? undefined,
      status: status ?? undefined,
    },
  });

  // Add creator as project member if possible
  try {
    const { user } = await requirePermission(req, "project:create");
    await prisma.projectMember.create({
      data: {
        projectId: newProject.id,
        userId: user.id,
        roleInProject: "LEAD",
      },
    });
  } catch (e) {
    // ignore addition failure (preserve project creation)
    console.warn("Could not add creator as project member", e);
  }

  return newProject;
});
