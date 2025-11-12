
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { expenseId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status } = await req.json();

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: params.expenseId },
      data: { status },
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
