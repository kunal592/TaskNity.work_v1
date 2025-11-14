// src/app/api/attendance/check-in/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const POST = withAuth(async (req: Request) => {
  // Require the ability to checkin (MEMBER & above)
  const { user } = await requirePermission(req, "attendance:checkin");

  const newAttendance = await prisma.attendance.create({
    data: {
      userId: user.id,
      checkIn: new Date(),
    },
  });

  return newAttendance;
});
