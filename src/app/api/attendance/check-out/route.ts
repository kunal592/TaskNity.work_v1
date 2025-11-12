
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkIn: {
          gte: today,
        },
        checkOut: null,
      },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { error: "No active check-in found for today" },
        { status: 400 }
      );
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: { checkOut: new Date() },
    });

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error("Error recording check-out:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
