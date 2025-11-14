// src/app/api/notices/[noticeId]/route.ts
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/requirePermission";

export const PUT = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "notice:update");
  const updatedData = await req.json();

  const updatedNotice = await prisma.notice.update({
    where: { id: params.noticeId },
    data: updatedData,
  });

  return updatedNotice;
});

export const DELETE = withAuth(async (req: Request, { params }: any) => {
  await requirePermission(req, "notice:delete");

  const updatedNotice = await prisma.notice.update({
    where: { id: params.noticeId },
    data: { isActive: false },
  });

  return updatedNotice;
});
