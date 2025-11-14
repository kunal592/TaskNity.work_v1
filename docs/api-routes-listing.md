# API Routes Listing

This file consolidates the selected API route files and their full contents with file paths, for reference.

---

## File: src/app/api/attendance/check-in/route.ts

```typescript
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
```

---

## File: src/app/api/attendance/route.ts

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

---

## File: src/app/api/auth/me/route.ts

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

---

## File: src/app/api/expenses/[expenseId]/route.ts

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

---

## File: src/app/api/expenses/my-requests/route.ts

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

---

## File: src/app/api/expenses/route.ts

```typescript
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
```

---

## File: src/app/api/invoices/route.ts

```typescript
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
```

---

## File: src/app/api/leave/[leaveId]/route.ts

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

---

## File: src/app/api/leave/my-requests/route.ts

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

---

## File: src/app/api/leave/route.ts

```typescript
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
```

---

## File: src/app/api/notices/[noticeId]/route.ts

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

---

## File: src/app/api/notices/route.ts

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

---

## File: src/app/api/projects/route.ts

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

---

## File: src/app/api/tasks/[taskId]/assign/route.ts

```typescript
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
```

---

## File: src/app/api/tasks/[taskId]/comments/route.ts

```typescript
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
```

---

## File: src/app/api/tasks/[taskId]/route.ts

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

---

## File: src/app/api/tasks/route.ts

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

---

## File: src/app/api/users/[userId]/route.ts

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

---

## File: src/app/api/users/route.ts

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

---

## File: src/app/api/webhooks/clerk/route.ts

```typescript
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
```

---

## File: src/lib/api-response.ts

```typescript
import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}
```

---

## File: src/lib/auth.ts

```typescript
import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Ensures user is authenticated and synced in DB.
 */
export async function requireAuth() {
  const clerk = await currentUser();

  if (!clerk) {
    throw new Error("UNAUTHORIZED");
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: clerk.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerk.id,
        email: clerk.emailAddresses?.[0]?.emailAddress || "",
        name: `${clerk.firstName || ""} ${clerk.lastName || ""}`,
        avatarUrl: clerk.imageUrl,
        role: UserRole.VIEWER,
      },
    });
  }

  return user;
}

/**
 * Ensures user has the required role(s)
 */
export async function requireRole(allowed: UserRole[]) {
  const user = await requireAuth();

  if (!allowed.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
```

---

## File: src/lib/db.ts

```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = 
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
```

---

## File: src/lib/permissionGuards.ts

```typescript
// src/lib/permissionGuards.ts
/* Lines 2-6 omitted */

/**
 * Resource shape we attempt to inspect for ownership.
 * You can extend this if your resources use different owner keys.
 */
type ResourceLike = { userId?: string; createdBy?: string; ownerId?: string } & Record<string, any>;

/**
 * Normalizes an action string and returns the "base" action and whether it's an "own" scoped action.
 * Examples:
 *  - "task:update" -> { base: "task:update", own: false }
 *  - "task:update:own" -> { base: "task:update", own: true }
 */
function parseAction(action: string) {
  const parts = action.split(":");
  const own = parts[parts.length - 1] === "own";
  const base = own ? parts.slice(0, -1).join(":") : action;
  return { base, own };
}

/**
 * Checks if the given role is allowed to perform action on a resource (optionally).
 * Rules:
 * 1) If RBAC[role][action] === true and action is NOT `:own` → allowed.
 * 2) If action is `:own`:
 *      - If RBAC[role][action] === true → allowed only if resource ownership check succeeds.
 *      - Else if RBAC[role][base] === true → allowed (role has global permission).
 * 3) Fallback: if RBAC[role][base] === true → allowed.
 */
export function hasPermissionAgainstResource(
  role: Role | string | undefined | null,
  action: string,
  resource?: ResourceLike
) {
  if (!role) /* Line 40 omitted */

  const { base, own } = parseAction(action);
  const rolePerms = (RBAC as any)[role as Role] as Record<string, boolean> | undefined;

  if (!rolePerms) /* Line 45 omitted */

  // exact action allowed (e.g., "task:update:own" or "task:update")
  if (rolePerms[action] === true) {/* Lines 49-52 omitted */}

  // if role has base/global permission (e.g., "task:update") then allowed
  if (rolePerms[base] === true) /* Line 55 omitted */

  // no permission
  return false;
}

/**
 * Very small heuristic for ownership check:
 * accepts common owner keys: userId, ownerId, createdBy
 */
function checkOwnership(resource?: ResourceLike) {
  if (!resource) /* Line 66 omitted */
  // owner keys
  const owner = resource.userId ?? resource.ownerId ?? resource.createdBy;
  return !!owner; // caller must compare owner === user.id externally
}

/**
 * requirePermission to be used inside routes.
 *
 * @param req - the incoming Request object (passed to getCurrentDbUser)
 * @param action - action string (may end with :own)
 * @param options.resourceFetcher - optional async function that returns the resource for ownership checks.
 *        resourceFetcher receives the route params object (context.params) or a params object you pass.
 *
 * Throws NextResponse (401 or 403) on failure — so can be used with withAuth wrapper that returns thrown responses.
 *
 * Returns the dbUser (useful for creating/updating) and optionally the resource when fetched.
 */
export async function requirePermission(
  req: Request,
  action: string,
  options?: {
    // function to fetch resource for ownership checks: (params) => resource
    resourceFetcher?: (params?: any) => Promise<ResourceLike | null | undefined>;
    params?: any;
    // allow custom ownerKey mapping (if ownership is stored as e.g. 'leadId' vs 'userId')
    ownerKey?: string; // optional override for ownership key
  }
) {
  const dbUser = await getCurrentDbUser(req);
  if (!dbUser) {/* Lines 97-98 omitted */}

  const { base, own } = parseAction(action);

  // If the action is own-scoped and a resourceFetcher is provided, get the resource
  let resource: ResourceLike | undefined = undefined;
  if (own && options?.resourceFetcher) {/* Lines 105-114 omitted */}

  // First, check if role has exact action (including :own)
  const rolePerms = (RBAC as any)[dbUser.role as Role] as Record<string, boolean> | undefined;

  if (rolePerms) {/* Lines 120-139 omitted */}

  // no permission
  /* Lines 142-143 omitted */
}
```

---

## File: src/lib/rbac.ts

```typescript
// src/lib/rbac.ts
export type Role = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

export const RBAC: Record<Role, Record<string, boolean>> = {
  ADMIN: {
    "user:create": true,
    "user:read": true,
    "user:update": true,
    "user:delete": true,

    "project:create": true,
    "project:read": true,
    "project:update": true,
    "project:delete": true,
    "project:member:update": true,

    "task:create": true,
    "task:read": true,
    "task:update": true,
    "task:delete": true,
    "task:assign": true,
    "task:comment": true,
    "task:attachment:upload": true,

    "attendance:read": true,
    "attendance:checkin": true,
    "attendance:checkout": true,
    "attendance:create": true,

    "leave:submit": true,
    "leave:my": true,
    "leave:read": true,
    "leave:review": true,

    "expenses:create": true,
    "expenses:my": true,
    "expenses:read": true,
    "expenses:review": true,

    "notice:create": true,
    "notice:read": true,
    "notice:update": true,
    "notice:delete": true,

    "invoice:create": true,
    "invoice:read": true,
    "invoice:update": true,
    "invoice:delete": true,

    "ai:task-analyze": true,
    "ai:notice-generate": true,
  },

  MANAGER: {
    "user:create": true,
    "user:read": true,
    "user:update": true,
    "user:delete": false,

    "project:create": true,
    "project:read": true,
    "project:update": true,
    "project:delete": false,
    "project:member:update": true,

    "task:create": true,
    "task:read": true,
    "task:update": true,
    "task:delete": false,
    "task:assign": true,
    "task:comment": true,
    "task:attachment:upload": true,

    "attendance:read": true,
    "attendance:checkin": true,
    "attendance:checkout": true,
    "attendance:create": true,

    "leave:submit": true,
    "leave:my": true,
    "leave:read": true,
    "leave:review": true,

    "expenses:create": true,
    "expenses:my": true,
    "expenses:read": true,
    "expenses:review": true,

    "notice:create": true,
    "notice:read": true,
    "notice:update": true,
    "notice:delete": false,

    "invoice:create": true,
    "invoice:read": true,
    "invoice:update": true,
    "invoice:delete": false,

    "ai:task-analyze": true,
    "ai:notice-generate": true,
  },

  MEMBER: {
    "user:read": true,

    "project:read": true,
    "project:members:read": true,

    "task:read": true,
    "task:comment": true,
    "task:update:own": true,
    "task:create": false,
    "task:assign": false,
    "task:attachment:upload": true,

    "attendance:checkin": true,
    "attendance:checkout": true,
    "attendance:create": true,

    "leave:submit": true,
    "leave:my": true,
    "leave:read": false,
    "leave:review": false,

    "expenses:create": true,
    "expenses:my": true,
    "expenses:read": false,
    "expenses:review": false,

    "notice:read": true,

    "invoice:read": true,

    "ai:task-analyze": false,
    "ai:notice-generate": false,
  },

  VIEWER: {
    "project:read": true,
    "notice:read": true,

    "user:read": false,
    "task:read": false,
    "attendance:checkin": false,
    "attendance:checkout": false,
    "attendance:create": false,

    "leave:submit": false,
    "leave:my": false,

    "expenses:create": false,
    "expenses:my": false,

    "invoice:read": false,

    "task:comment": false,
    "task:update": false,
    "task:assign": false,
    "project:member:update": false,

    "ai:task-analyze": false,
    "ai:notice-generate": false,
  },
};

// tiny helper: direct check (true only if RBAC explicitly true)
export function can(role: Role | string | undefined | null, action: string): boolean {
  if (!role) return false;
  const r = role as Role;
  const perms = (RBAC as any)[r];
  if (!perms) return false;
  return perms[action] === true;
}
```

---

## File: src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## File: src/middleware.ts

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/login",
  "/register",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!isPublicRoute(req) && !userId) {
    return (await auth()).redirectToSignIn();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

## File: prisma/schema.prisma

```prisma
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
  MANAGER
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
```

---

## File: src/context/AppContext.tsx

```tsx
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
```

