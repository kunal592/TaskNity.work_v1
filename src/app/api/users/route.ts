// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { clerkClient, getAuth, auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = (global as any).prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") (global as any).prisma = prisma;

/**
 * Helper: get currently authenticated DB user (by clerkId)
 */
async function getCurrentDbUser(req: Request) {
  // try getAuth(req) first (works in many Clerk setups), fallback to auth()
  let userId: string | undefined | null = undefined;
  try {
    // getAuth may be sync
    // @ts-ignore
    const authRes = getAuth ? getAuth(req) : undefined;
    userId = authRes?.userId;
  } catch (e) {
    // ignore
  }

  try {
    if (!userId) {
      // auth() returns a promise in some setups
      // @ts-ignore
      const authRes2 = await auth();
      userId = authRes2?.userId;
    }
  } catch (e) {
    // ignore
  }

  if (!userId) return null;
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  return dbUser;
}

export async function GET(req: Request) {
  try {
    const dbUser = await getCurrentDbUser(req);
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        joinedAt: true,
        team: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser(req);
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, role, position, department, team } = body ?? {};

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create user in Clerk
        // clerkClient may be an async factory, call it to get the client instance
        // Provide email in the shape Clerk expects
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.createUser({
          emailAddress: [email],
          firstName: name,
          publicMetadata: { role }, // optional: store role in Clerk public metadata as well
        });

    // create DB record linking to clerkId
    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
        // prisma enum accepts same string values (ADMIN/MEMBER/VIEWER)
        role,
        // optional extra fields
        team: team ?? null,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    // If Clerk returned a more descriptive error, show sanitized message
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
