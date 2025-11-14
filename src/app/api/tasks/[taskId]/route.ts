// src/app/api/tasks/[taskId]/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "task:read");
  const task = await prisma.task.findUnique({ where: { id: params.taskId } });
  if (!task) return new Response(JSON.stringify({ error: "Task not found" }), { status: 404 });
  return task;
});

export const PUT = withAuth(async (req: Request, { params }: any) => {
  // MEMBER: task:update:own — enforce ownership, ADMIN/MANAGER have task:update
  const { user } = await requirePermission(req, "task:update:own", {
    params,
    resourceFetcher: async (p: any) => prisma.task.findUnique({ where: { id: p.taskId } }),
    ownerKey: "createdBy", // your Task model stores owner in createdBy
  });

  const updatedData = await req.json();
  const updatedTask = await prisma.task.update({
    where: { id: params.taskId },
    data: updatedData,
  });
  return updatedTask;
});

export const DELETE = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "task:delete");
  await prisma.task.delete({ where: { id: params.taskId } });
  return { message: "Task deleted successfully" };
});
