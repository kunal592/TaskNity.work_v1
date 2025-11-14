// src/app/api/expenses/my-requests/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  const { user } = await requirePermission(req, "expenses:my");
  const expenses = await prisma.expense.findMany({ where: { userId: user.id } });
  return expenses;
});
