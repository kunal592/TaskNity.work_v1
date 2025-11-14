// src/app/api/attendance/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  // require attendance:read (ADMIN/MANAGER per RBAC)
  await requirePermission(req, "attendance:read");

  const attendanceRecords = await prisma.attendance.findMany();

  return attendanceRecords;
});
