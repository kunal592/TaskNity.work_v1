// src/app/api/projects/route.ts
import { NextResponse } from "next/server";
import { getAuth, auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = (global as any).prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") (global as any).prisma = prisma;

async function getCurrentDbUser(req: Request) {
  let userId: string | undefined | null = undefined;
  try {
    // @ts-ignore
    const authRes = getAuth ? getAuth(req) : undefined;
    userId = authRes?.userId;
  } catch (e) {}
  try {
    if (!userId) {
      // @ts-ignore
      const authRes2 = await auth();
      userId = authRes2?.userId;
    }
  } catch (e) {}
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

    // Everyone authenticated can list projects (you can tighten this later)
    const projects = await prisma.project.findMany({
      include: {
        lead: {
          select: { id: true, name: true, email: true, role: true }
        },
        members: {
          select: { id: true, userId: true, roleInProject: true }
        }
      }
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentDbUser(req);
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Authorize: only ADMINs or MEMBERs allowed to create projects (adjustable)
    if (dbUser.role !== "ADMIN" && dbUser.role !== "MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, leadId, startDate, endDate, status } = body ?? {};

    if (!name) {
      return NextResponse.json({ error: "Missing required fields: name" }, { status: 400 });
    }

    // convert start/end date if provided
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const newProject = await prisma.project.create({
      data: {
        name,
        description: description ?? null,
        leadId: leadId ?? null,
        startDate: start ?? undefined,
        endDate: end ?? undefined,
        status: status ?? undefined,
      },
    });

    // Optionally add the creator as a ProjectMember (as MEMBER)
    try {
      await prisma.projectMember.create({
        data: {
          projectId: newProject.id,
          userId: dbUser.id,
          roleInProject: "LEAD", // Make creator the lead for convenience; change if not desired
        },
      });
    } catch (pmErr) {
      // If duplicate or other error, log but do not fail project creation
      console.warn("Could not create project member entry for creator:", pmErr);
    }

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
