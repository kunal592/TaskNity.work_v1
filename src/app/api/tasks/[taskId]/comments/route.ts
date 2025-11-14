// src/app/api/tasks/[taskId]/comments/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const POST = withAuth(async (req: Request, { params }: any) => {
  // any authenticated user who can comment
  await requirePermission(req, "task:comment");
  const { text } = await req.json();

  if (!text) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });

  const { user } = await requirePermission(req, "task:comment");

  const newComment = await prisma.taskComment.create({
    data: {
      text,
      taskId: params.taskId,
      userId: user.id,
    },
  });

  return newComment;
});
