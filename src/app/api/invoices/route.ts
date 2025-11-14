// src/app/api/invoices/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "invoice:read");
  const invoices = await prisma.invoice.findMany();
  return invoices;
});

export const POST = withAuth(async (req: Request) => {
  await requirePermission(req, "invoice:create");

  const { projectId, amount, dueDate } = await req.json();

  if (!projectId || !amount || !dueDate) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const newInvoice = await prisma.invoice.create({
    data: {
      projectId,
      amount,
      issuedBy: (await requirePermission(req, "invoice:create")).user.id,
      issuedAt: new Date(),
      status: "DRAFT",
    },
  });

  return newInvoice;
});
