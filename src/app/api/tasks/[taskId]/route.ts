
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { ...updatedData } = await req.json();

    const updatedTask = await prisma.task.update({
      where: { id: params.taskId },
      data: updatedData,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: params.taskId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
