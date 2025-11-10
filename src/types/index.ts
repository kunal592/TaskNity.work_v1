
export type User = {
  id: string;
  name: string;
  role: 'Admin' | 'Member' | 'Viewer';
  email: string;
  phone?: string;
  address?: string;
  team?: string;
  salary?: number;
  github?: string;
  linkedin?: string;
  joined: string;
};

export type Project = {
  id: string;
  title: string;
  progress: number;
  members: User[];
  isPublic?: boolean;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'In Progress' | 'To Do' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  projectId: string;
  assignedTo: string[];
  deadline?: string;
  classified?: boolean;
  isDraft?: boolean;
};

export type Attendance = {
  id: string;
  userId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Remote' | 'On Leave';
};

export type Leave = {
    id: string;
    userId: string;
    reason: string;
    date: string;
    status: 'Approved' | 'Pending' | 'Rejected';
};

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  requestedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected';
};

export type RoleAccess = {
  canManageProjects: boolean;
  canManageTasks: boolean;
  canViewAnalytics: boolean;
  canManageTeam: boolean;
  canMarkAttendance: boolean;
  canManageExpenses: boolean;
};

export type AppContextType = {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  tasks: Task[];
  attendance: Attendance[];
  leaves: Leave[];
  setLeaves: (leaves: Leave[]) => void;
  expenses: Expense[];
  expenseCategories: string[];
  roleAccess: RoleAccess;
  setCurrentUser: (user: User | null) => void;
  markAttendance: (status: Attendance['status']) => void;
  setTasks: (tasks: Task[]) => void;
};
