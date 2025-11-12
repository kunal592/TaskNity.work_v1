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
    const fetchData = async () => {
      try {
        const [
          usersResponse,
          projectsResponse,
          tasksResponse,
          attendanceResponse,
          leavesResponse,
          expensesResponse,
          currentUserResponse,
        ] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/projects'),
          axios.get('/api/tasks'),
          axios.get('/api/attendance'),
          axios.get('/api/leave'),
          axios.get('/api/expenses'),
          axios.get('/api/auth/me'),
        ]);

        setUsers(usersResponse.data);
        setProjects(projectsResponse.data);
        setTasks(tasksResponse.data);
        setAttendance(attendanceResponse.data);
        setLeaves(leavesResponse.data);
        setExpenses(expensesResponse.data);
        setCurrentUser(currentUserResponse.data);
        
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };

    fetchData();
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
