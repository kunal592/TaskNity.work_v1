
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany();

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { sessionClaims } = await auth();
    const { name, description, leadId, startDate, endDate, status } = await req.json();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!name || !description || !leadId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        leadId,
        startDate,
        endDate,
        status,
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
