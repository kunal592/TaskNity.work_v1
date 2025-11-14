// src/app/api/leave/[leaveId]/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const PUT = withAuth(async (req: Request, { params }: any) => {
  // approval requires leave:review
  const { user } = await requirePermission(req, "leave:review");

  const { status } = await req.json();
  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 });
  }

  const updatedLeaveRequest = await prisma.leave.update({
    where: { id: params.leaveId },
    data: {
      status,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    },
  });

  return updatedLeaveRequest;
});
