// src/app/api/tasks/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "task:read");
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const tasks = await prisma.task.findMany({
    where: {
      ...(projectId && { projectId }),
    },
  });

  return tasks;
});

export const POST = withAuth(async (req: Request) => {
  await requirePermission(req, "task:create");
  const {
    title,
    description,
    projectId,
    status,
    priority,
    dueDate,
    assigneeId,
  } = await req.json();

  if (!title || !description || !projectId) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const { user } = await requirePermission(req, "task:create");

  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      status,
      priority,
      deadline: dueDate ? new Date(dueDate) : undefined,
      createdBy: user.id,
      published: true,
    },
  });

  // create assignee record if provided
  if (assigneeId) {
    try {
      await prisma.taskAssignee.create({
        data: { taskId: newTask.id, userId: assigneeId },
      });
    } catch (e) {
      console.warn("Could not add assignee:", e);
    }
  }

  return newTask;
});
