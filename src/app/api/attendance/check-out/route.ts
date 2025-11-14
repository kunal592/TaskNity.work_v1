// src/app/api/attendance/check-out/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const POST = withAuth(async (req: Request) => {
  // require checkout permission (members and above)
  const { user } = await requirePermission(req, "attendance:checkout");

  // find last open checkin (without checkOut)
  const last = await prisma.attendance.findFirst({
    where: { userId: user.id, checkOut: null },
    orderBy: { checkIn: "desc" },
  });

  if (!last) {
    return new Response(JSON.stringify({ error: "No active check-in found" }), { status: 400 });
  }

  const updated = await prisma.attendance.update({
    where: { id: last.id },
    data: { checkOut: new Date() },
  });

  return updated;
});
