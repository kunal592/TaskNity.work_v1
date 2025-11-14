// src/app/api/dashboard/stats/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

/**
 * GET /api/dashboard/stats
 * Lightweight stats for the dashboard card (counts)
 */
export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "dashboard:read");

  const [projectsCount, tasksOpen, leavesPending, expensesPending] = await Promise.all([
    prisma.project.count(),
    prisma.task.count({ where: { status: "TODO" } }),
    prisma.leave.count({ where: { status: "PENDING" } }),
    prisma.expense.count({ where: { status: "PENDING" } }),
  ]);

  return { projectsCount, tasksOpen, leavesPending, expensesPending };
});
