
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        taskId: params.taskId,
        userId,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
