
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notices = await prisma.notice.findMany({
      where: { isActive: true },
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newNotice = await prisma.notice.create({
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(newNotice, { status: 201 });
  } catch (error) {
    console.error("Error creating notice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
