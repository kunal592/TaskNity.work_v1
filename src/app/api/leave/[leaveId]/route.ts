
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { leaveId: string } }) {
  try {
    const { sessionClaims, userId: clerkId } = await auth();

    if ((sessionClaims?.metadata as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
        where: { clerkId }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


    const { leaveId } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedLeaveRequest = await prisma.leave.update({
      where: {
        id: leaveId,
      },
      data: {
        status,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json(updatedLeaveRequest);
  } catch (error) {
    console.error("Error updating leave request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
