"use client";
import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from "react";
import { users as mockUsers, projects as mockProjects, tasks as mockTasks, attendance as mockAttendance, expenses as mockExpenses, expenseCategories as mockExpenseCategories, leaves as mockLeaves } from "@/mock/data";
import type { AppContextType, User, Project, Task, Attendance, Expense, Leave } from '@/types';

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const role = "Member"; // Defaulting to 'Member' as role switcher is removed.
  const [users] = useState<User[]>(mockUsers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance);
  const [leaves, setLeaves] = useState<Leave[]>(mockLeaves);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [expenseCategories] = useState<string[]>(mockExpenseCategories);

  useEffect(() => {
    // Setting user based on the hardcoded role.
    const userForRole = users.find(u => u.role === role);
    setCurrentUser(userForRole || users.find(u => u.role === 'Member') || users[0] || null);
  }, [users]);
  
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
