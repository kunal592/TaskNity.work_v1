
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

    const newAttendance = await prisma.attendance.create({
      data: {
        userId,
        checkIn: new Date(),
      },
    });

    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error("Error recording check-in:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
