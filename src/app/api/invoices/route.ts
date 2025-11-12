
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "FINANCE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const invoices = await prisma.invoice.findMany();

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
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

    if (userRole !== "ADMIN" && userRole !== "FINANCE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { projectId, amount, dueDate } = await req.json();

    if (!projectId || !amount || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        projectId,
        amount,
        dueDate,
        status: "PENDING",
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
