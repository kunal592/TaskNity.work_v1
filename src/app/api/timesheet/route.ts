// src/app/api/timesheet/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

/**
 * Timesheet endpoints:
 * GET -> list timesheets (manager/admin can see all; member sees own)
 * POST -> submit timesheet (member)
 *
 * Timesheet model is not present in your Prisma schema by default.
 * We'll use a minimal table "timesheet" via Prisma if it exists.
 * If not present, these routes fallback to a simple in-memory error prompting you to add the model.
 */
export const GET = withAuth(async (req: Request) => {
  // try to detect timesheet model
  try {
    const { user } = await requirePermission(req, "timesheet:read");
    // if manager/admin they likely have global permission; members may only have timesheet:my
    const isGlobal = (await requirePermission(req, "timesheet:read")).user.role !== "MEMBER";

    if (isGlobal) {
      // list all timesheets
      const timesheets = await (prisma as any).timesheet.findMany();
      return timesheets;
    } else {
      // list own
      const timesheets = await (prisma as any).timesheet.findMany({ where: { userId: user.id } });
      return timesheets;
    }
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Timesheet model not found or permission denied. Add `model Timesheet` to Prisma schema or adjust RBAC." }), { status: 500 });
  }
});

export const POST = withAuth(async (req: Request) => {
  const { user } = await requirePermission(req, "timesheet:submit");
  const payload = await req.json();
  const { date, hours, projectId, notes } = payload ?? {};
  if (!date || !hours) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });

  try {
    const created = await (prisma as any).timesheet.create({
      data: {
        userId: user.id,
        date: new Date(date),
        hours,
        projectId: projectId ?? null,
        notes: notes ?? null,
      },
    });
    return created;
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Timesheet creation failed. Ensure Timesheet model exists in Prisma." }), { status: 500 });
  }
});
