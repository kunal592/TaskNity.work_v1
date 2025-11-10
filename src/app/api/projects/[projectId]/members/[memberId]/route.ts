
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.projectMember.deleteMany({
      where: { 
        projectId: params.projectId,
        userId: params.memberId
       },
    });

    return NextResponse.json({ message: "Project member removed successfully" });
  } catch (error) {
    console.error("Error removing project member:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
