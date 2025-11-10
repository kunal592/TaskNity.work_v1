
import type { User, Project, Task, Attendance, Expense, Leave } from "@/types";

export const users: User[] = [
  { id: 'user-1', name: "Alice Carter", email: "alice@example.com", role: "Admin", joined: "2024-01-05", team: "Core", phone: "123-456-7890", address: "123 Main St, Anytown USA" },
  { id: 'user-2', name: "Brian Lee", email: "brian@example.com", role: "Member", joined: "2024-02-15", team: "Frontend", phone: "123-456-7891", address: "456 Oak Ave, Anytown USA" },
  { id: 'user-3', name: "Chloe Patel", email: "chloe@example.com", role: "Viewer", joined: "2024-03-10", team: "Design", phone: "123-456-7892", address: "789 Pine Ln, Anytown USA" },
  { id: 'user-4', name: "David Kim", email: "david@example.com", role: "Member", joined: "2024-01-20", team: "Backend", phone: "123-456-7893", address: "101 Maple Dr, Anytown USA" },
];

export const projects: Project[] = [
  { id: 'proj-1', title: "Website Redesign", progress: 70, members: [users[0], users[1], users[3]], isPublic: true },
  { id: 'proj-2', title: "Mobile App 'Zenith'", progress: 45, members: [users[1], users[2]], isPublic: true },
  { id: 'proj-3', title: "API Development", progress: 90, members: [users[0], users[3]], isPublic: false },
  { id: 'proj-4', title: "Q3 Marketing Campaign", progress: 25, members: [users[1], users[2]], isPublic: true },
];

export const tasks: Task[] = [
  { id: 'task-1', title: "Setup Landing Page", description: "Create the main landing page with the new design.", status: "In Progress", priority: "High", projectId: 'proj-1', assignedTo: ['user-2'], isDraft: false },
  { id: 'task-2', title: "Fix Login Bug", description: "Users are reporting issues when logging in with special characters in their password.", status: "To Do", priority: "Medium", projectId: 'proj-2', assignedTo: ['user-2', 'user-4'], isDraft: false },
  { id: 'task-3', title: "Design new dashboard mockups", description: "Create mockups for the new analytics dashboard.", status: "To Do", priority: "High", projectId: 'proj-1', assignedTo: ['user-1', 'user-3'], isDraft: false },
  { id: 'task-4', title: "Implement push notifications", description: "Add push notification functionality to the mobile app.", status: "In Progress", priority: "Medium", projectId: 'proj-2', assignedTo: ['user-2'], isDraft: false },
  { id: 'task-5', title: "Deploy staging environment", description: "Set up and deploy the staging environment for testing.", status: "Done", priority: "Low", projectId: 'proj-3', assignedTo: ['user-4'], isDraft: false },
  { id: 'task-6', title: "Write API documentation", description: "Document all endpoints for the new API.", status: "Done", priority: "Medium", projectId: 'proj-3', assignedTo: ['user-1'], isDraft: false },
  { id: 'task-7', title: "Create social media assets", description: "Design and create assets for the upcoming social media campaign.", status: "To Do", priority: "Low", projectId: 'proj-4', assignedTo: ['user-3'], isDraft: false },
  { id: 'task-8', title: "Test payment gateway", description: "Thoroughly test the new payment gateway integration.", status: "In Progress", priority: "High", projectId: 'proj-1', assignedTo: ['user-4', 'user-1'], isDraft: false },
  { id: 'task-9', title: "Project Plan Outline", description: "Outline the initial plan for the project.", status: "To Do", priority: "High", projectId: 'proj-1', assignedTo: ['user-1'], isDraft: true },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);


export const attendance: Attendance[] = [
    { id: 'att-1', userId: 'user-2', date: twoDaysAgo.toISOString().split("T")[0], status: "Present" },
    { id: 'att-2', userId: 'user-2', date: yesterday.toISOString().split("T")[0], status: "Present" },
    { id: 'att-3', userId: 'user-2', date: today.toISOString().split("T")[0], status: "On Leave" },
    { id: 'att-4', userId: 'user-1', date: today.toISOString().split("T")[0], status: "Present" },
    { id: 'att-5', userId: 'user-3', date: today.toISOString().split("T")[0], status: "Remote" },
    { id: 'att-6', userId: 'user-4', date: today.toISOString().split("T")[0], status: "Absent" },
];

export const leaves: Leave[] = [
    { id: 'leave-1', userId: 'user-2', reason: 'Family emergency', date: today.toISOString().split("T")[0], status: 'Approved'},
    { id: 'leave-2', userId: 'user-4', reason: 'Not feeling well', date: today.toISOString().split("T")[0], status: 'Pending'},
];

export const expenses: Expense[] = [
  {
    id: "exp001",
    title: "AWS Hosting",
    category: "Infrastructure",
    amount: 120,
    date: "2025-10-20",
    requestedBy: "Alice Carter",
    status: "Approved",
  },
  {
    id: "exp002",
    title: "Team Lunch",
    category: "HR",
    amount: 85,
    date: "2025-10-25",
    requestedBy: "Brian Lee",
    status: "Pending",
  },
  {
    id: "exp003",
    title: "Figma Subscription",
    category: "Design",
    amount: 45,
    date: "2025-10-27",
    requestedBy: "Alice Carter",
    status: "Approved",
  },
];

export const expenseCategories = [
  "Infrastructure",
  "HR",
  "Design",
  "Marketing",
  "Operations",
  "SaaS",
  "Misc",
];
