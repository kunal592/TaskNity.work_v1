import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // Safety: only allow in non-production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id: clerkId, name, email, role } = body;

    if (!clerkId || !email) {
      return NextResponse.json({ error: "Missing clerkId or email" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { clerkId } });
    if (existing) {
      return NextResponse.json({ error: "User already exists", user: existing }, { status: 409 });
    }

    const created = await prisma.user.create({
      data: {
        clerkId,
        name: name || undefined,
        email,
        role: (role || "MEMBER") as any,
      },
    });

    return NextResponse.json({ status: "created", user: created });
  } catch (err) {
    console.error("test-create webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
