// src/app/api/meeting/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

/**
 * Meetings: create / list
 * NOTE: Prisma model 'Meeting' not present by default. If absent, response instructs to add model.
 */

export const GET = withAuth(async (req: Request) => {
  try {
    await requirePermission(req, "meeting:read");
    const meetings = await (prisma as any).meeting.findMany();
    return meetings;
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Meeting model not present in Prisma or permission denied. Add Meeting model." }), { status: 500 });
  }
});

export const POST = withAuth(async (req: Request) => {
  await requirePermission(req, "meeting:create");

  const { title, startsAt, endsAt, participants } = await req.json();
  if (!title || !startsAt || !endsAt) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });

  try {
    const created = await (prisma as any).meeting.create({
      data: {
        title,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        participants: participants ?? [],
      },
    });
    return created;
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Meeting creation failed. Add Meeting model to Prisma." }), { status: 500 });
  }
});
