// src/app/api/expenses/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  // management of all expenses requires expenses:read
  await requirePermission(req, "expenses:read");

  const expenses = await prisma.expense.findMany();
  return expenses;
});

export const POST = withAuth(async (req: Request) => {
  const { user } = await requirePermission(req, "expenses:create");

  const { amount, description, projectId, category, receiptUrl } = await req.json();

  if (!amount || !description) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const newExpense = await prisma.expense.create({
    data: {
      userId: user.id,
      amount,
      description,
      projectId: projectId ?? null,
      status: "PENDING",
      category: category ?? null,
      receiptUrl: receiptUrl ?? null,
    },
  });

  return Response.json(newExpense);
});
