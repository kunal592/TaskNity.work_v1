✅ TaskNity Backend API — README (Production Documentation)

Tech Stack: Next.js App Router · Prisma · PostgreSQL · Clerk Auth · RBAC · File Uploads · Timesheet · Analytics · AI-ready
Author: TaskNity.work Engineering

📌 Overview

This backend powers TaskNity.work, a full-suite team management system containing:

Authentication (Clerk)

User management

Projects & project members

Tasks (with ownership rules)

Comments & assignments

Attendance (check-in/out)

Leave requests

Expenses & finance

Invoices

Notices

Meetings

Timesheets

Analytics + Dashboard stats

Secure file uploads

Full RBAC + action-based permissions

All APIs are implemented using Next.js App Router, server-only route handlers, and Prisma ORM.

📁 Project Structure (API Only)
src/app/api/
  attendance/
    check-in/
    check-out/
    route.ts
  auth/me/
  expenses/
    [expenseId]/
    my-requests/
  invoices/
  leave/
    [leaveId]/
    my-requests/
  notices/
    [noticeId]/
  projects/
    [projectId]/
      members/
        [memberId]/
  tasks/
    [taskId]/
      assign/
      comments/
  users/
    [userId]/
  webhooks/clerk/
    test-create/
  analytics/
  dashboard/
    stats/
  timesheet/
  meeting/
  files/upload/
  reports/

🔐 Authentication

We use Clerk for identity & sessions.

GET /api/auth/me

Syncs Clerk user → Prisma user

Ensures a valid DB record exists

Returns current Prisma user object

🛡 Role-Based Access Control (RBAC)

All permission logic is centralized in:

src/lib/rbac.ts
src/lib/requirePermission.ts

Roles:

ADMIN – full system access

MANAGER – full access except destructive operations

MEMBER – employee-level access

VIEWER – public read-only

Action-based permission example:
"task:update" → managers/admins  
"task:update:own" → only owner (Member)  
"invoice:create" → managers/admins  
"notice:delete" → admin only  

Ownership rule

Members cannot update tasks created by others.
Enforced via:

requirePermission(req, "task:update:own", {
  resourceFetcher: () => prisma.task.findUnique(...),
  ownerKey: "createdBy",
});


Managers/Admins bypass :own and use task:update.

📌 Core Helpers (Mandatory)
withAuth(handler)

Standardized error handling

Allows handlers to return plain objects

Automatically converts responses

requirePermission(req, action, options?)

Verifies role permission

Enforces ownership if :own suffix is present

Throws NextResponse on 401/403

requireUser(req)

Ensures valid logged-in user

Returns Prisma user

🎯 API Summary (High-Level)
Attendance

✓ Check-in
✓ Check-out
✓ List all (manager/admin)

Projects

✓ Create, read, update, delete
✓ Member management
✓ Auto-add creator as LEAD

Tasks

✓ CRUD
✓ Assign
✓ Comments
✓ Ownership: only creator = editable for Members

Expenses

✓ Submit
✓ My expenses
✓ Approve/reject (manager/admin)

Invoices

✓ Create, read, update, delete

Leave Requests

✓ Submit
✓ My leaves
✓ Approve/reject

Notices

✓ CRUD
✓ Soft-delete

Users

✓ Create (Clerk + DB)
✓ Read, update, delete
✓ Role assignment

Meetings

✓ Create
✓ List
(Requires Meeting model in Prisma)

Timesheet

✓ Submit
✓ List
(Requires Timesheet model in Prisma)

File Upload

✓ Secure Base64 upload → /uploads
✓ File download

Reports

✓ Basic finance + leave summaries

Analytics

✓ Task counts, finance stats, active users

Dashboard Stats

✓ Counts for homepage cards

📦 Environment Variables
DATABASE_URL="postgresql://..."
CLERK_WEBHOOK_SECRET="..."
CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."

🗂 File Upload Setup

Uploads stored under:

/uploads/<timestamp>-<filename>


To serve the directory:

Create uploads/ at project root:

mkdir uploads && chmod 700 uploads


For production, use:

AWS S3

GCP Storage

Cloudflare R2
(ask and I’ll generate the full integration)

🧪 Ownership Enforcement Example (Member cannot update others’ tasks)

PUT /api/tasks/[taskId]

requirePermission(req, "task:update:own", {
  resourceFetcher: () => prisma.task.findUnique({ where: { id: taskId } }),
  ownerKey: "createdBy",
});


Outcome:

Role	Can Update Own?	Can Update Others?
ADMIN	YES	YES
MANAGER	YES	YES
MEMBER	YES	❌ NO
VIEWER	❌	❌
🧩 Models required for Timesheet/Meeting APIs

If you want full functionality, add to schema.prisma:

Timesheet model
model Timesheet {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  date      DateTime
  hours     Float
  projectId String?
  notes     String?
  createdAt DateTime @default(now())
}

Meeting model
model Meeting {
  id          String   @id @default(cuid())
  title       String
  startsAt    DateTime
  endsAt      DateTime
  participants Json?
  createdAt   DateTime @default(now())
}


Then run:

npx prisma migrate dev

🧠 RBAC Action Reference (Complete)
user:create        user:delete          task:update
user:read          project:create       task:update:own
user:update        project:read         task:assign
project:delete     project:member:update
attendance:checkin attendance:checkout
attendance:read    leave:submit
leave:review       expenses:review
notice:create      notice:delete
notice:update      invoice:create
invoice:update     invoice:delete
analytics:read     dashboard:read
timesheet:submit   timesheet:read
file:upload        meeting:create
meeting:read       reports:read
ai:task-analyze    ai:notice-generate

🚀 Deployment Notes
Local dev:
npm install
npm run dev

Production Build:
npm run build
npm run start

Prisma:
npx prisma generate
npx prisma migrate dev


Ensure database + Clerk secrets are set in environment.

📝 Final Notes

All endpoints are production-grade and validated.

All RBAC rules are enforced server-side.

Ownership logic is fully implemented.

Code is compatible with edge or node runtimes.

No feature or relation was removed from your original project.

Missing models produce safe fallback errors with upgrade instructions.

✅ DONE



-----------------------------------------

cat << 'EOF'
┌─────────────────────────────── RBAC MATRIX ───────────────────────────────┐
│ Action / Role                    │ ADMIN │ MANAGER │ MEMBER │ VIEWER │
├──────────────────────────────────┼───────┼─────────┼────────┼────────┤

│ user:create                      │   ✔   │    ✔    │   ✖    │   ✖    │
│ user:read                        │   ✔   │    ✔    │   ✔    │   ✖    │
│ user:update                      │   ✔   │    ✔    │   ✖    │   ✖    │
│ user:delete                      │   ✔   │    ✖    │   ✖    │   ✖    │

│ project:create                   │   ✔   │    ✔    │   ✖    │   ✖    │
│ project:read                     │   ✔   │    ✔    │   ✔    │   ✔    │
│ project:update                   │   ✔   │    ✔    │   ✖    │   ✖    │
│ project:delete                   │   ✔   │    ✖    │   ✖    │   ✖    │
│ project:member:update            │   ✔   │    ✔    │   ✖    │   ✖    │
│ project:members:read             │   ✔   │    ✔    │   ✔    │   ✖    │

│ task:create                      │   ✔   │    ✔    │   ✖    │   ✖    │
│ task:read                        │   ✔   │    ✔    │   ✔    │   ✖    │
│ task:update                      │   ✔   │    ✔    │   ✖    │   ✖    │
│ task:update:own                  │   ✔   │    ✔    │   ✔    │   ✖    │
│ task:delete                      │   ✔   │    ✖    │   ✖    │   ✖    │
│ task:assign                      │   ✔   │    ✔    │   ✖    │   ✖    │
│ task:comment                     │   ✔   │    ✔    │   ✔    │   ✖    │
│ task:attachment:upload           │   ✔   │    ✔    │   ✔    │   ✖    │

│ attendance:read                  │   ✔   │    ✔    │   ✖    │   ✖    │
│ attendance:checkin               │   ✔   │    ✔    │   ✔    │   ✖    │
│ attendance:checkout              │   ✔   │    ✔    │   ✔    │   ✖    │
│ attendance:create                │   ✔   │    ✔    │   ✔    │   ✖    │

│ leave:submit                     │   ✔   │    ✔    │   ✔    │   ✖    │
│ leave:my                         │   ✔   │    ✔    │   ✔    │   ✖    │
│ leave:read                       │   ✔   │    ✔    │   ✖    │   ✖    │
│ leave:review                     │   ✔   │    ✔    │   ✖    │   ✖    │

│ expenses:create                  │   ✔   │    ✔    │   ✔    │   ✖    │
│ expenses:my                      │   ✔   │    ✔    │   ✔    │   ✖    │
│ expenses:read                    │   ✔   │    ✔    │   ✖    │   ✖    │
│ expenses:review                  │   ✔   │    ✔    │   ✖    │   ✖    │

│ notice:create                    │   ✔   │    ✔    │   ✖    │   ✖    │
│ notice:read                      │   ✔   │    ✔    │   ✔    │   ✔    │
│ notice:update                    │   ✔   │    ✔    │   ✖    │   ✖    │
│ notice:delete                    │   ✔   │    ✖    │   ✖    │   ✖    │

│ invoice:create                   │   ✔   │    ✔    │   ✖    │   ✖    │
│ invoice:read                     │   ✔   │    ✔    │   ✔    │   ✖    │
│ invoice:update                   │   ✔   │    ✔    │   ✖    │   ✖    │
│ invoice:delete                   │   ✔   │    ✖    │   ✖    │   ✖    │

│ dashboard:read                   │   ✔   │    ✔    │   ✔    │   ✔    │
│ analytics:read                   │   ✔   │    ✔    │   ✖    │   ✖    │

│ timesheet:read                   │   ✔   │    ✔    │   ✖    │   ✖    │
│ timesheet:submit                 │   ✔   │    ✔    │   ✔    │   ✖    │

│ file:upload                      │   ✔   │    ✔    │   ✔    │   ✖    │

│ meeting:create                   │   ✔   │    ✔    │   ✖    │   ✖    │
│ meeting:read                     │   ✔   │    ✔    │   ✔    │   ✖    │

│ reports:read                     │   ✔   │    ✔    │   ✖    │   ✖    │

│ ai:task-analyze                  │   ✔   │    ✔    │   ✖    │   ✖    │
│ ai:notice-generate               │   ✔   │    ✔    │   ✖    │   ✖    │

└──────────────────────────────────────────────────────────────────────────┘
EOF
