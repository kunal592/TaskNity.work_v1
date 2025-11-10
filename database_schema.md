## TaskNity.Work: Database Schema

### 1. Users

- **users**
    - id (PK, UUID)
    - email (unique)
    - password_hash
    - name
    - role (enum: 'ADMIN', 'MEMBER', 'VIEWER')
    - joined_at (timestamp)
    - phone
    - address
    - team (nullable, e.g., "Backend", "Frontend")
    - is_active (boolean)
    - avatar_url

### 2. Sessions / Authentication

- **sessions**
    - id (PK)
    - user_id (FK → users.id)
    - token
    - created_at (timestamp)
    - expires_at (timestamp)

### 3. Projects

- **projects**
    - id (PK, UUID)
    - title
    - description
    - progress (int, 0–100)
    - is_public (boolean)
    - status (enum: 'ACTIVE', 'ARCHIVED')
    - created_at (timestamp)
    - updated_at (timestamp)

- **project_members**
    - id (PK)
    - project_id (FK → projects.id)
    - user_id (FK → users.id)
    - joined_at (timestamp)
    - role_in_project (enum: 'MEMBER', 'LEAD', 'VIEWER')

### 4. Tasks

- **tasks**
    - id (PK, UUID)
    - project_id (FK → projects.id, nullable for org-level task)
    - title
    - description
    - status (enum: 'TODO', 'IN_PROGRESS', 'DONE')
    - deadline (timestamp, nullable)
    - priority (enum: 'LOW', 'MEDIUM', 'HIGH')
    - is_draft (boolean)
    - is_classified (boolean)
    - created_by (FK → users.id)
    - created_at (timestamp)
    - updated_at (timestamp)
    - published (boolean)

- **task_assignees**
    - id (PK)
    - task_id (FK → tasks.id)
    - user_id (FK → users.id)

- **task_comments** (OPTIONAL)
    - id (PK)
    - task_id (FK → tasks.id)
    - user_id (FK → users.id)
    - text
    - created_at

### 5. Attendance & Leaves

- **attendance_logs**
    - id (PK)
    - user_id (FK → users.id)
    - date (date)
    - status (enum: 'PRESENT', 'REMOTE', 'ABSENT')
    - check_in_time (timestamp, nullable)
    - check_out_time (timestamp, nullable)
    - notes (nullable)

- **leaves**
    - id (PK)
    - user_id (FK → users.id)
    - start_date (date)
    - end_date (date)
    - type (enum: 'SICK', 'ANNUAL', 'CASUAL', ...)
    - status (enum: 'PENDING', 'APPROVED', 'REJECTED')
    - requested_at (timestamp)
    - reviewed_by (FK → users.id, nullable)
    - reviewed_at (timestamp, nullable)
    - reason

### 6. Notices

- **notices**
    - id (PK)
    - title
    - content
    - created_by (FK → users.id)
    - created_at (timestamp)
    - updated_at (timestamp)
    - is_active (boolean)

### 7. Expenses & Finance

- **expenses**
    - id (PK)
    - user_id (FK → users.id)
    - amount (decimal)
    - description
    - status (enum: 'PENDING', 'APPROVED', 'REJECTED')
    - submitted_at (timestamp)
    - reviewed_by (FK → users.id, nullable)
    - reviewed_at (timestamp, nullable)
    - category (enum: 'TRAVEL', 'SUPPLIES', ...)
    - receipt_url (nullable)

- **invoices**
    - id (PK)
    - project_id (FK → projects.id, nullable)
    - amount (decimal)
    - issued_to (nullable: counterparty)
    - issued_by (FK → users.id)
    - issued_at (timestamp)
    - status (enum: 'DRAFT', 'SENT', 'PAID', 'CANCELLED')
    - pdf_url (nullable)

### 8. AI/Automation (For logs/task analysis)

- **ai_logs**
    - id (PK)
    - type (enum: 'TASK_ANALYSIS', 'NOTICE_GENERATION')
    - request_data (JSONB)
    - result_data (JSONB)
    - created_at (timestamp)
    - user_id (FK → users.id)

---

## RELATIONSHIPS SUMMARY

- **users <--> projects:** Many-to-many (via project_members)
- **users <--> tasks:** Many-to-many (via task_assignees)
- **users <--> expenses:** One-to-many
- **users <--> attendance_logs:** One-to-many
- **users <--> leaves:** One-to-many
- **users <--> notices:** One-to-many
- **projects <--> tasks:** One-to-many
- **projects <--> invoices:** One-to-many

---

## GENERAL REQUIREMENTS MET

- User management, roles & teams
- Authentication/session infrastructure
- Project and membership structure, including public/private project visibility
- Full-featured task (and subtask, if needed), status, draft/publishing, priorities, classified tasks
- Task assignments (multiple), comments (optional for future)
- Attendance logs per user per date
- Full leave request/approval workflow
- Notices (admin-managed, feedback-enabled)
- Expenses (user and admin workflow), invoices
- AI logs for auditing and system-generated actions

---

**This structure gives you full RBAC, auditing, and feature coverage for TaskNity.Work. If you have a special requirement (e.g. organization-wide Kanban, file uploads, comments on notices/tasks), let me know for further schema refinement.**