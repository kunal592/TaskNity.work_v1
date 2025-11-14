// prisma/schema.prisma
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
  ledProjects      Project[]       @relation("ProjectLead")
  reviewedLeaves   Leave[]         @relation("ReviewedLeaves")

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
  title       String?
  name        String // added to align with API payloads that send `name`
  description String?
  progress    Int           @default(0)
  isPublic    Boolean       @default(false)
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Additional fields used by your routes
  startDate DateTime?
  endDate   DateTime?

  // Relations
  members  ProjectMember[]
  tasks    Task[]
  invoices Invoice[]

  // relation back to lead (optional)
  leadId String?
  lead   User?   @relation("ProjectLead", fields: [leadId], references: [id], onDelete: SetNull)

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
  id       String    @id @default(uuid())
  userId   String
  checkIn  DateTime
  checkOut DateTime?

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




## src/app/api/auth/me/route.ts
```typescript
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
```

## src/app/api/expenses/[expenseId]/route.ts
```typescript
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
```

## src/app/api/expenses/my-requests/route.ts
```typescript
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
```

## src/app/api/leave/[leaveId]/route.ts
```typescript
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
```

## src/app/api/leave/my-requests/route.ts
```typescript
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
```

## src/app/api/notices/[noticeId]/route.ts
```typescript
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
```

## src/app/api/projects/[projectId]/route.ts
```typescript
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
```

## src/app/api/tasks/[taskId]/route.ts
```typescript
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
```

## src/app/api/users/[userId]/route.ts
```typescript
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
```

## src/app/api/attendance/route.ts
```typescript
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { sessionClaims } = await auth();
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const attendanceRecords = await prisma.attendance.findMany();

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

## src/app/api/notices/route.ts
```typescript
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
```

## src/app/api/projects/route.ts
```typescript
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
```

## src/app/api/tasks/route.ts
```typescript
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
```

## src/app/api/users/route.ts
```typescript
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
```
