
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId: params.projectId },
      include: { user: true },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const { userId, role } = await req.json();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId: params.projectId,
        userId,
        role,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error adding project member:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
