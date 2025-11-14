// src/app/api/analytics/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

/**
 * GET /api/analytics
 * Returns aggregated, high-level analytics for finance, tasks, user activity.
 * Permission: analytics:read (Admins & Managers)
 */
export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "analytics:read");

  // Example aggregates: open tasks by status, expenses summary, active users
  const [taskCounts, expensesSum, activeUsers] = await Promise.all([
    prisma.task.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED" },
    }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  return {
    tasks: taskCounts,
    approvedExpenseSum: expensesSum._sum?.amount ?? "0.00",
    activeUsers,
  };
});
