// src/app/api/webhooks/clerk/test-create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * small test endpoint to create a fake user during development
 * Protect this route with middleware or remove in production.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, role } = body ?? {};
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const u = await prisma.user.create({
      data: {
        clerkId: `dev-${Date.now()}`,
        email,
        name: `${firstName ?? ""} ${lastName ?? ""}`.trim() || null,
        role: (role as any) ?? "MEMBER",
      },
    });

    return NextResponse.json(u, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
