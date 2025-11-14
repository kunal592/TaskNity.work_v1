// src/app/api/leave/my-requests/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  const { user } = await requirePermission(req, "leave:my");
  const leaveRequests = await prisma.leave.findMany({ where: { userId: user.id } });
  return leaveRequests;
});
