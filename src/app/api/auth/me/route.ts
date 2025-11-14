import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    console.log("1. Handler reached");

    const clerk = await currentUser();
    console.log("2. Clerk:", clerk);

    const clerkId = clerk?.id;
    console.log("3. Clerk ID:", clerkId);

    if (!clerkId) {
      console.log("4. No Clerk ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to find existing user in Prisma
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    console.log("5. Prisma result:", user);

    // If user not found → CREATE it (auto-sync)
    if (!user) {
      console.log("6. User not found → creating new user in DB...");

      user = await prisma.user.create({
        data: {
          clerkId,
          email: clerk.emailAddresses?.[0]?.emailAddress || "",
          name: `${clerk.firstName || ""} ${clerk.lastName || ""}`.trim() || null,
          avatarUrl: clerk.imageUrl || null,
          role: "VIEWER", // default role from your Prisma schema
          isActive: true,
        },
      });

      console.log("7. User created:", user);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("🔥 ERROR in /api/auth/me:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
