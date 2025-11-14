// src/app/api/leave/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "leave:read");
  const leaveRequests = await prisma.leave.findMany();
  return leaveRequests;
});

export const POST = withAuth(async (req: Request) => {
  const { user } = await requirePermission(req, "leave:submit");
  const { startDate, endDate, reason, type } = await req.json();

  if (!startDate || !endDate || !reason) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const newLeaveRequest = await prisma.leave.create({
    data: {
      userId: user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      type: type ?? undefined,
      status: "PENDING",
      requestedAt: new Date(),
    },
  });

  return newLeaveRequest;
});
