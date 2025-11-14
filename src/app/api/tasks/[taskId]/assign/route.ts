// src/app/api/tasks/[taskId]/assign/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const POST = withAuth(async (req: Request, { params }: any) => {
  // assign requires task:assign
  await requirePermission(req, "task:assign");
  const { userId } = await req.json();

  if (!userId) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });

  const updatedTask = await prisma.task.update({
    where: { id: params.taskId },
    data: { /* original uses assigneeId field - preserve */ assigneeId: userId },
  });

  return updatedTask;
});
