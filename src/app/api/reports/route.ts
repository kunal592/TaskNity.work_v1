// src/app/api/reports/route.ts
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { prisma } from "@/lib/db";

export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "reports:read");

  // basic example: return list of recent leaves and expenses
  const [recentLeaves, recentExpenses] = await Promise.all([
    prisma.leave.findMany({ orderBy: { requestedAt: "desc" }, take: 10 }),
    prisma.expense.findMany({ orderBy: { submittedAt: "desc" }, take: 10 }),
  ]);

  return { recentLeaves, recentExpenses };
});
