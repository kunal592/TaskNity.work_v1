# this is my current full endpoints api

## dont remove any feature i want to have complete working things, this is in respect to frontend





/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["relationJoins"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// -----------------------------------------
// ENUMS
// -----------------------------------------

enum UserRole {
  ADMIN
  MEMBER
  VIEWER
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
}

enum ProjectMemberRole {
  MEMBER
  LEAD
  VIEWER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

enum AttendanceStatus {
  PRESENT
  REMOTE
  ABSENT
}

enum LeaveType {
  SICK
  ANNUAL
  CASUAL
  OTHER
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ExpenseCategory {
  TRAVEL
  SUPPLIES
  FOOD
  OTHER
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  CANCELLED
}

enum AiLogType {
  TASK_ANALYSIS
  NOTICE_GENERATION
}

// -----------------------------------------
// MODELS
// -----------------------------------------

model User {
  id           String   @id @default(uuid())
  clerkId      String?  @unique // optional: Clerk userId link
  email        String   @unique
  passwordHash String? // not needed if using Clerk
  name         String?
  role         UserRole @default(VIEWER)
  joinedAt     DateTime @default(now())
  phone        String?
  address      String?
  team         String?
  isActive     Boolean  @default(true)
  avatarUrl    String?

  // Relations
  sessions         Session[]
  createdTasks     Task[]          @relation("CreatedTasks")
  assignedTasks    TaskAssignee[]
  projectMembers   ProjectMember[]
  attendanceLogs   AttendanceLog[]
  leaves           Leave[]
  createdNotices   Notice[]
  expenses         Expense[]       @relation("UserExpenses")
  reviewedExpenses Expense[]       @relation("ReviewedExpenses")
  invoices         Invoice[]
  aiLogs           AiLog[]
  attendance       Attendance[]

  reviewedLeaves Leave[] @relation("ReviewedLeaves")

  taskComments TaskComment[]

  @@map("users")
}

// -----------------------------------------

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  createdAt DateTime @default(now())
  expiresAt DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// -----------------------------------------

model Project {
  id          String        @id @default(uuid())
  title       String
  description String?
  progress    Int           @default(0)
  isPublic    Boolean       @default(false)
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  members  ProjectMember[]
  tasks    Task[]
  invoices Invoice[]

  @@map("projects")
}

// -----------------------------------------

model ProjectMember {
  id            String            @id @default(uuid())
  projectId     String
  userId        String
  joinedAt      DateTime          @default(now())
  roleInProject ProjectMemberRole @default(MEMBER)

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@map("project_members")
}

// -----------------------------------------

model Task {
  id           String       @id @default(uuid())
  projectId    String?
  title        String
  description  String?
  status       TaskStatus   @default(TODO)
  deadline     DateTime?
  priority     TaskPriority @default(MEDIUM)
  isDraft      Boolean      @default(false)
  isClassified Boolean      @default(false)
  createdBy    String
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  published    Boolean      @default(false)

  // Relations
  project   Project?       @relation(fields: [projectId], references: [id], onDelete: SetNull)
  creator   User           @relation("CreatedTasks", fields: [createdBy], references: [id], onDelete: Cascade)
  assignees TaskAssignee[]
  comments  TaskComment[]

  @@map("tasks")
}

// -----------------------------------------

model TaskAssignee {
  id     String @id @default(uuid())
  taskId String
  userId String

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([taskId, userId])
  @@map("task_assignees")
}

// -----------------------------------------

model TaskComment {
  id        String   @id @default(uuid())
  taskId    String
  userId    String
  text      String
  createdAt DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("task_comments")
}

// -----------------------------------------

model Attendance {
  id        String    @id @default(uuid())
  userId    String
  checkIn   DateTime
  checkOut  DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("attendance")
}

model AttendanceLog {
  id           String           @id @default(uuid())
  userId       String
  date         DateTime
  status       AttendanceStatus
  checkInTime  DateTime?
  checkOutTime DateTime?
  notes        String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@map("attendance_logs")
}

// -----------------------------------------

model Leave {
  id          String      @id @default(uuid())
  userId      String
  startDate   DateTime
  endDate     DateTime
  type        LeaveType   @default(OTHER)
  status      LeaveStatus @default(PENDING)
  requestedAt DateTime    @default(now())
  reviewedBy  String?
  reviewedAt  DateTime?
  reason      String

  user     User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviewer User? @relation("ReviewedLeaves", fields: [reviewedBy], references: [id], onDelete: SetNull)

  @@map("leaves")
}

// -----------------------------------------

model Notice {
  id        String   @id @default(uuid())
  title     String
  content   String
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isActive  Boolean  @default(true)

  creator User @relation(fields: [createdBy], references: [id], onDelete: Cascade)

  @@map("notices")
}

// -----------------------------------------

model Expense {
  id          String          @id @default(uuid())
  userId      String
  amount      Decimal         @db.Decimal(10, 2)
  description String
  status      ExpenseStatus   @default(PENDING)
  submittedAt DateTime        @default(now())
  reviewedBy  String?
  reviewedAt  DateTime?
  category    ExpenseCategory @default(OTHER)
  receiptUrl  String?

  user     User  @relation("UserExpenses", fields: [userId], references: [id], onDelete: Cascade)
  reviewer User? @relation("ReviewedExpenses", fields: [reviewedBy], references: [id], onDelete: SetNull)

  @@map("expenses")
}

// -----------------------------------------

model Invoice {
  id        String        @id @default(uuid())
  projectId String?
  amount    Decimal       @db.Decimal(10, 2)
  issuedTo  String?
  issuedBy  String
  issuedAt  DateTime      @default(now())
  status    InvoiceStatus @default(DRAFT)
  pdfUrl    String?

  project Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  issuer  User     @relation(fields: [issuedBy], references: [id], onDelete: Cascade)

  @@map("invoices")
}

// -----------------------------------------

model AiLog {
  id          String    @id @default(uuid())
  type        AiLogType
  requestData Json
  resultData  Json?
  createdAt   DateTime  @default(now())
  userId      String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("ai_logs")
}





/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/attendance/check-in/route.ts


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


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/attendance/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const attendance = await prisma.attendance.findMany();

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}



/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/auth/me/route.ts


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

/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/expenses/[expenseId]/route.ts

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



/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/expenses/my-requests/route.ts


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

    const expenses = await prisma.expense.findMany({
      where: { userId },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching user expenses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/expenses/route.ts


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const expenses = await prisma.expense.findMany();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, description, projectId } = await req.json();

    if (!amount || !description || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newExpense = await prisma.expense.create({
      data: {
        amount,
        description,
        projectId,
        userId,
        status: "PENDING",
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/invoices/route.ts


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


src/app/api/leave/[leaveId]/route.ts


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { leaveId: string } }
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

    const updatedLeaveRequest = await prisma.leave.update({
      where: { id: params.leaveId },
      data: { status },
    });

    return NextResponse.json(updatedLeaveRequest);
  } catch (error) {
    console.error("Error updating leave request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


src/app/api/leave/my-requests/route.ts


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

    const leaveRequests = await prisma.leave.findMany({
      where: { userId },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Error fetching user leave requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/leave/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const leaveRequests = await prisma.leave.findMany();

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { startDate, endDate, reason } = await req.json();

    if (!startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newLeaveRequest = await prisma.leave.create({
      data: {
        userId,
        startDate,
        endDate,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(newLeaveRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


src/app/api/notices/[noticeId]/route.ts


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { noticeId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { ...updatedData } = await req.json();

    const updatedNotice = await prisma.notice.update({
      where: { id: params.noticeId },
      data: updatedData,
    });

    return NextResponse.json(updatedNotice);
  } catch (error) {
    console.error("Error updating notice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { noticeId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedNotice = await prisma.notice.update({
      where: { id: params.noticeId },
      data: { isActive: false },
    });

    return NextResponse.json(updatedNotice);
  } catch (error) {
    console.error("Error deactivating notice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


src/app/api/notices/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notices = await prisma.notice.findMany({
      where: { isActive: true },
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
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

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newNotice = await prisma.notice.create({
      data: {
        title,
        content,
        createdBy: (await auth()).userId!,
      },
    });

    return NextResponse.json(newNotice, { status: 201 });
  } catch (error) {
    console.error("Error creating notice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


src/app/api/projects/[projectId]/members/[memberId]/route.ts


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.projectMember.deleteMany({
      where: { 
        projectId: params.projectId,
        userId: params.memberId
       },
    });

    return NextResponse.json({ message: "Project member removed successfully" });
  } catch (error) {
    console.error("Error removing project member:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/projects/[projectId]/members/route.ts


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId: params.projectId },
      include: { user: true },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const { userId, role } = await req.json();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId: params.projectId,
        userId,
        role,
      },
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error adding project member:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/projects/[projectId]/route.ts


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const { ...updatedData } = await req.json();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.projectId },
      data: updatedData,
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id: params.projectId },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/projects/route.ts


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



/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/tasks/[taskId]/assign/route.ts


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.taskId },
      data: { assigneeId: userId },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error assigning task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/tasks/[taskId]/comments/route.ts


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        taskId: params.taskId,
        userId,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/tasks/[taskId]/route.ts


import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { ...updatedData } = await req.json();

    const updatedTask = await prisma.task.update({
      where: { id: params.taskId },
      data: updatedData,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: params.taskId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/tasks/route.ts


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
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
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

    if (userRole !== "ADMIN" && userRole !== "LEAD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      title,
      description,
      projectId,
      status,
      priority,
      dueDate,
      assigneeId,
    } = await req.json();

    if (!title || !description || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        status,
        priority,
        dueDate,
        assigneeId,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/users/[userId]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { sessionClaims } = await auth();

    if ((sessionClaims?.metadata as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { sessionClaims } = await auth();

    if ((sessionClaims?.metadata as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { ...updatedData } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: updatedData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { sessionClaims } = await auth();

    if ((sessionClaims?.metadata as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: params.userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/users/route.ts

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { sessionClaims } = await auth();

    if ((sessionClaims?.metadata as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { sessionClaims } = await auth();

    if ((sessionClaims?.metadata as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, name, role, position, department, team } = await req.json();

    if (!email || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.createUser({
        emailAddress: [email],
    });

    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
        role,
        position,
        department,
        team,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/app/api/webhooks/clerk/route.ts

import { headers } from "next/headers";
import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = await headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event;

  try {
    event = wh.verify(payload, svixHeaders) as any;
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  // Auto-create user
  if (type === "user.created") {
    await prisma.user.create({
      data: {
        clerkId: data.id,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email_addresses?.[0]?.email_address,
        role: "MEMBER",
      },
    });
  }

  return NextResponse.json({ status: "ok" });
}

/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/context/AppContext.tsx

"use client";
import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from "react";
import type { AppContextType, User, Project, Task, Attendance, Expense, Leave } from '@/types';
import axios from 'axios';

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUserResponse = await axios.get('/api/auth/me');
        const user = currentUserResponse.data;
        setCurrentUser(user);
        return user;
      } catch (error) {
        console.error("Failed to fetch current user", error);
        // If we can't get the user, don't fetch other data
        return null;
      }
    };

    const fetchAllData = async (user: User) => {
        try {
            const dataRequests = [
                axios.get('/api/projects'),
                axios.get('/api/tasks'),
                axios.get('/api/attendance'),
                axios.get('/api/leave'),
                axios.get('/api/expenses'),
            ];

            // Only fetch all users if the current user is an admin
            if (user.role === 'Admin') {
                dataRequests.unshift(axios.get('/api/users'));
            } else {
                // Otherwise, just populate the users array with the current user
                setUsers([user]);
            }

            const responses = await Promise.all(dataRequests);

            let responseIndex = 0;
            if (user.role === 'Admin') {
                setUsers(responses[responseIndex++].data);
            }

            setProjects(responses[responseIndex++].data);
            setTasks(responses[responseIndex++].data);
            setAttendance(responses[responseIndex++].data);
            setLeaves(responses[responseIndex++].data);
            setExpenses(responses[responseIndex++].data);
        
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const initialize = async () => {
        const user = await fetchCurrentUser();
        if (user) {
            await fetchAllData(user);
        }
    }

    initialize();
  }, []);
  
  const markAttendance = (status: Attendance['status']) => {
    const today = new Date().toISOString().split("T")[0];
    if (!currentUser) return;

    const existingEntry = attendance.find(
      (a) => a.userId === currentUser.id && a.date === today
    );

    if (!existingEntry) {
      const newAttendance: Attendance = {
        id: `att-${Date.now()}`,
        userId: currentUser.id,
        date: today,
        status,
      };
      setAttendance([...attendance, newAttendance]);
    }
  };

  const roleAccess = {
    canManageProjects: currentUser?.role === "Admin",
    canManageTasks: currentUser ? ["Admin", "Member"].includes(currentUser.role) : false,
    canViewAnalytics: currentUser ? ["Admin", "Member", "Viewer"].includes(currentUser.role) : false,
    canManageTeam: currentUser?.role === "Admin",
    canMarkAttendance: currentUser ? ["Admin", "Member"].includes(currentUser.role) : false,
    canManageExpenses: currentUser?.role === "Admin",
  };
  
  const value: AppContextType = {
    currentUser,
    users,
    projects,
    setProjects,
    tasks,
    setCurrentUser: (user: User | null) => setCurrentUser(user),
    setTasks,
    attendance,
    markAttendance,
    leaves,
    setLeaves,
    roleAccess,
    expenses,
    expenseCategories,
  }
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}


/Users/kunal/Desktop/Appnity_works_bin/TaskNity_work_v1/src/middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/login",
  "/register",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (!isPublicRoute(req) && !userId) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};


