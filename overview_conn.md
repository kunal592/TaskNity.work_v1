# Project Overview: TaskNity.Work

## 1. Introduction

TaskNity.Work is a comprehensive, feature-rich task and project management application designed to streamline team collaboration and enhance productivity. It provides a robust suite of tools for managing projects, tasks, finances, and team members within a hierarchical organizational structure. The application is built with a modern, role-based access control system, ensuring that users only see the information relevant to their position.

The frontend is currently operating with mock data, and this document outlines the necessary API endpoints and backend logic required to transition it to a fully functional, data-driven application.

## 2. Core Features

*   **Role-Based Access Control (RBAC):** Three predefined roles (Admin, Member, Viewer) with distinct permissions for managing and viewing data.
*   **Project Management:** Create and manage projects, toggle public/private visibility, track progress, and assign members.
*   **Kanban Task Board:** A visual, drag-and-drop interface to manage tasks across "To Do", "In Progress", and "Done" statuses.
*   **Detailed Task Management:** Create tasks with titles, descriptions, priorities, deadlines, multiple assignees, and a "classified" status for sensitive work.
*   **Draft Tasks:** Create tasks within a project that remain hidden from the main Kanban board until explicitly published.
*   **User Profiles:** Individual profile pages displaying user details, assigned tasks, performance metrics, and attendance history.
*   **Team & Hierarchy Management:** An organizational chart to visualize team structure and a dedicated section for managing team members.
*   **Leaderboard:** A "Top Contributors" panel that ranks users based on the number of completed tasks.
*   **Finance & Expense Tracking:** Modules for tracking company expenses, managing reimbursement requests, and generating invoices.
*   **Admin Dashboard:** Centralized views for admins to manage company finances, send notices, and monitor classified tasks.

## 3. Technology Stack

The application is built using a modern, performant, and scalable technology stack:

*   **Framework:** Next.js (with App Router)
*   **Language:** TypeScript
*   **UI Components:** ShadCN UI, Radix UI
*   **Styling:** Tailwind CSS
*   **State Management:** React Context API, Zustand
*   **Animations:** Framer Motion
*   **Drag & Drop:** dnd-kit
*   **Charting:** Recharts
*   **PDF Generation:** jsPDF, html2canvas
*   **Linting/Formatting:** ESLint, Prettier

## 4. Required API Endpoints for Backend Integration

The following RESTful API endpoints are suggested to replace the current mock data structure. A session-based authentication mechanism (e.g., using cookies or JWTs) is assumed to manage user identity and permissions.

### Authentication

*   `POST /api/auth/login`: Authenticate a user and start a session.
*   `POST /api/auth/register`: Create a new user account.
*   `POST /api/auth/logout`: Terminate the current user's session.
*   `GET /api/auth/me`: Retrieve the profile of the currently authenticated user.

### Users

*   `GET /api/users`: Get a list of all users in the organization.
*   `GET /api/users/{userId}`: Get detailed information for a specific user.
*   `POST /api/users`: Add a new user/employee (Admin only).
*   `PUT /api/users/{userId}`: Update an existing user's information (Admin only).
*   `DELETE /api/users/{userId}`: Terminate/delete a user (Admin only).

### Projects

*   `GET /api/projects`: Get a list of all projects (Admins see all; Members/Viewers see public projects and projects they are members of).
*   `GET /api/projects/{projectId}`: Get details for a specific project.
*   `POST /api/projects`: Create a new project (Admin only).
*   `PUT /api/projects/{projectId}`: Update a project's details (e.g., title, members, public/private status, progress) (Admin only).
*   `DELETE /api/projects/{projectId}`: Delete a project (Admin only).

### Tasks

*   `GET /api/tasks`: Get all non-classified, non-draft tasks for the Kanban board.
*   `GET /api/tasks/classified`: Get all classified tasks (Admin only).
*   `GET /api/projects/{projectId}/tasks`: Get all tasks (including drafts) for a specific project.
*   `POST /api/tasks`: Create a new task.
*   `PUT /api/tasks/{taskId}`: Update a task's details (e.g., status, priority, description, assignees, publish status).
*   `DELETE /api/tasks/{taskId}`: Delete a task.

### Notices (Admin)

*   `GET /api/notices`: Get all admin notices.
*   `POST /api/notices`: Create a new notice (Admin only).
*   `PUT /api/notices/{noticeId}`: Update a notice (e.g., user feedback).
*   `DELETE /api/notices/{noticeId}`: Delete a notice (Admin only).

### Attendance

*   `GET /api/attendance/{userId}`: Get attendance logs for a specific user.
*   `POST /api/attendance`: Mark attendance for the current user (Present or Remote).

### Expenses & Finance

*   `GET /api/expenses`: Get all expense requests (Admin only).
*   `GET /api/expenses/my-requests`: Get expense requests for the currently logged-in user.
*   `POST /api/expenses`: Submit a new expense request.
*   `PUT /api/expenses/{expenseId}`: Update an expense's status (Approve/Reject) (Admin only).
*   `GET /api/invoices`: Get all invoices.
*   `POST /api/invoices`: Create and store a new invoice.

## 5. Backend & Database Suggestions

*   **Backend Framework:** A Node.js framework like **Express.js** or **NestJS** would integrate well with the TypeScript/JavaScript ecosystem.
*   **Database:** A relational database like **PostgreSQL** is highly recommended for managing the structured data and relationships between users, projects, tasks, and financial records. An ORM like **Prisma** or **TypeORM** would provide type safety and simplify database interactions.
*   **Real-time Updates:** For features like the Kanban board and live notifications, consider implementing **WebSockets** (e.g., using `socket.io`) to push real-time updates to clients, providing a more dynamic user experience than traditional polling.
*   **Authentication:** Implement a robust authentication strategy. JWTs (JSON Web Tokens) stored in secure, HTTP-only cookies are a standard and secure approach.
*   **Permissions:** The backend must rigorously enforce the role-based access control (RBAC) logic. Each endpoint should validate the user's role and permissions before processing a request to prevent unauthorized data access or modification.

This document provides a clear path forward for developing the backend services required to power TaskNity.Work. By implementing these endpoints and following the suggested architecture, you can transform the prototype into a fully functional and scalable application.