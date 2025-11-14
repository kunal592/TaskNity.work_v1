// src/lib/rbac.ts
export type Role = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

export const RBAC: Record<Role, Record<string, boolean>> = {
  // -----------------------------------------
  // ADMIN – full unrestricted system access
  // -----------------------------------------
  ADMIN: {
    // Users
    "user:create": true,
    "user:read": true,
    "user:update": true,
    "user:delete": true,

    // Projects
    "project:create": true,
    "project:read": true,
    "project:update": true,
    "project:delete": true,
    "project:member:update": true,

    // Tasks
    "task:create": true,
    "task:read": true,
    "task:update": true,
    "task:delete": true,
    "task:assign": true,
    "task:comment": true,
    "task:attachment:upload": true,

    // Attendance
    "attendance:read": true,
    "attendance:checkin": true,
    "attendance:checkout": true,
    "attendance:create": true,

    // Leave
    "leave:submit": true,
    "leave:my": true,
    "leave:read": true,
    "leave:review": true,

    // Expenses
    "expenses:create": true,
    "expenses:my": true,
    "expenses:read": true,
    "expenses:review": true,

    // Notices
    "notice:create": true,
    "notice:read": true,
    "notice:update": true,
    "notice:delete": true,

    // Invoices
    "invoice:create": true,
    "invoice:read": true,
    "invoice:update": true,
    "invoice:delete": true,

    // Dashboard & Analytics
    "dashboard:read": true,
    "analytics:read": true,

    // Timesheet
    "timesheet:read": true,
    "timesheet:submit": true,

    // Files
    "file:upload": true,

    // Meetings
    "meeting:create": true,
    "meeting:read": true,

    // Reports
    "reports:read": true,

    // AI Tools
    "ai:task-analyze": true,
    "ai:notice-generate": true,
  },

  // ---------------------------------------------------------
  // MANAGER – full managerial power except destructive ops
  // ---------------------------------------------------------
  MANAGER: {
    // Users
    "user:create": true,
    "user:read": true,
    "user:update": true,
    "user:delete": false,

    // Projects
    "project:create": true,
    "project:read": true,
    "project:update": true,
    "project:delete": false,
    "project:member:update": true,

    // Tasks
    "task:create": true,
    "task:read": true,
    "task:update": true,
    "task:delete": false,
    "task:assign": true,
    "task:comment": true,
    "task:attachment:upload": true,

    // Attendance
    "attendance:read": true,
    "attendance:checkin": true,
    "attendance:checkout": true,
    "attendance:create": true,

    // Leave
    "leave:submit": true,
    "leave:my": true,
    "leave:read": true,
    "leave:review": true,

    // Expenses
    "expenses:create": true,
    "expenses:my": true,
    "expenses:read": true,
    "expenses:review": true,

    // Notices
    "notice:create": true,
    "notice:read": true,
    "notice:update": true,
    "notice:delete": false,

    // Invoices
    "invoice:create": true,
    "invoice:read": true,
    "invoice:update": true,
    "invoice:delete": false,

    // Dashboard & Analytics
    "dashboard:read": true,
    "analytics:read": true,

    // Timesheet
    "timesheet:read": true,
    "timesheet:submit": true,

    // Files
    "file:upload": true,

    // Meetings
    "meeting:create": true,
    "meeting:read": true,

    // Reports
    "reports:read": true,

    // AI Tools
    "ai:task-analyze": true,
    "ai:notice-generate": true,
  },

  // ------------------------------------------------
  // MEMBER – employee-level access + own resources
  // ------------------------------------------------
  MEMBER: {
    // Users
    "user:read": true,

    // Projects
    "project:read": true,
    "project:members:read": true,

    // Tasks
    "task:read": true,
    "task:comment": true,
    "task:update:own": true,
    "task:create": false,
    "task:assign": false,
    "task:attachment:upload": true,

    // Attendance
    "attendance:checkin": true,
    "attendance:checkout": true,
    "attendance:create": true,

    // Leave
    "leave:submit": true,
    "leave:my": true,
    "leave:read": false,
    "leave:review": false,

    // Expenses
    "expenses:create": true,
    "expenses:my": true,
    "expenses:read": false,
    "expenses:review": false,

    // Notices
    "notice:read": true,

    // Invoices
    "invoice:read": true,

    // Dashboard
    "dashboard:read": true,

    // Timesheet
    "timesheet:submit": true,

    // Files
    "file:upload": true,

    // Meetings (attending only, reading meetings)
    "meeting:read": true,
    "meeting:create": false,

    // Reports
    "reports:read": false,

    // Analytics
    "analytics:read": false,

    // AI Tools
    "ai:task-analyze": false,
    "ai:notice-generate": false,
  },

  // ------------------------------------------
  // VIEWER – read-only (restricted)
  // ------------------------------------------
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

    // Dashboard partial access
    "dashboard:read": true,

    // No analytics
    "analytics:read": false,

    // No files
    "file:upload": false,

    // Meetings
    "meeting:read": false,
    "meeting:create": false,

    // Timesheet
    "timesheet:submit": false,
    "timesheet:read": false,

    // Reports
    "reports:read": false,

    // AI
    "ai:task-analyze": false,
    "ai:notice-generate": false,
  },
};

export function can(role: Role | string | undefined | null, action: string): boolean {
  if (!role) return false;
  const perms = RBAC[role as Role];
  return perms?.[action] === true;
}
