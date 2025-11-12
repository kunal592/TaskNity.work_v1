
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { noticeId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { ...updatedData } = await req.json();

    const updatedNotice = await prisma.notice.update({
      where: { id: params.noticeId },
      data: updatedData,
    });

    return NextResponse.json(updatedNotice);
  } catch (error) {
    console.error("Error updating notice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { noticeId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedNotice = await prisma.notice.update({
      where: { id: params.noticeId },
      data: { isActive: false },
    });

    return NextResponse.json(updatedNotice);
  } catch (error) {
    console.error("Error deactivating notice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
