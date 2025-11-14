// src/app/api/expenses/[expenseId]/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const PUT = withAuth(async (req: Request, { params }: any) => {
  // Only users with expenses:review can approve/reject
  const { user } = await requirePermission(req, "expenses:review");

  const body = await req.json();
  const status = body?.status;

  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 });
  }

  const updatedExpense = await prisma.expense.update({
    where: { id: params.expenseId },
    data: {
      status,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    },
  });

  return updatedExpense;
});
