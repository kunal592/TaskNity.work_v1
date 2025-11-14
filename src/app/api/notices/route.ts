// src/app/api/notices/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "notice:read");
  const notices = await prisma.notice.findMany({ where: { isActive: true } });
  return notices;
});

export const POST = withAuth(async (req: Request) => {
  await requirePermission(req, "notice:create");
  const { title, content } = await req.json();
  if (!title || !content) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });

  const { user } = await requirePermission(req, "notice:create"); // get user for createdBy

  const newNotice = await prisma.notice.create({
    data: {
      title,
      content,
      createdBy: user.id,
    },
  });

  return newNotice;
});
