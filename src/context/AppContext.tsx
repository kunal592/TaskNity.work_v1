"use client";
import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from "react";
import type { AppContextType, User, Project, Task, Attendance, Expense, Leave } from '@/types';
import axios from 'axios';

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  // Default role — can be overridden with NEXT_PUBLIC_DEFAULT_ROLE env var
  const role = (process.env.NEXT_PUBLIC_DEFAULT_ROLE as string) || "Admin";
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
            const dataRequests: Promise<any>[] = [];
            const fetchKeys: string[] = [];

            // Only fetch all users if the current user has permission
            try {
              await axios.get('/api/users');
              dataRequests.push(axios.get('/api/users'));
              fetchKeys.push('users');
            } catch (error) {
              // User doesn't have permission, skip users fetch
              setUsers([user]);
            }

            // Always fetch these
            dataRequests.push(axios.get('/api/projects'));
            fetchKeys.push('projects');
            
            dataRequests.push(axios.get('/api/tasks'));
            fetchKeys.push('tasks');
            
            dataRequests.push(axios.get('/api/attendance'));
            fetchKeys.push('attendance');
            
            dataRequests.push(axios.get('/api/leave'));
            fetchKeys.push('leave');
            
            dataRequests.push(axios.get('/api/expenses'));
            fetchKeys.push('expenses');

            const responses = await Promise.allSettled(dataRequests);

            responses.forEach((response, index) => {
              if (response.status === 'fulfilled') {
                const key = fetchKeys[index];
                const data = response.value.data;
                
                switch(key) {
                  case 'users':
                    setUsers(Array.isArray(data) ? data : (data?.users || [user]));
                    break;
                  case 'projects':
                    setProjects(Array.isArray(data) ? data : (data?.projects || []));
                    break;
                  case 'tasks':
                    setTasks(Array.isArray(data) ? data : (data?.tasks || []));
                    break;
                  case 'attendance':
                    setAttendance(Array.isArray(data) ? data : (data?.attendance || []));
                    break;
                  case 'leave':
                    setLeaves(Array.isArray(data) ? data : (data?.leaves || []));
                    break;
                  case 'expenses':
                    setExpenses(Array.isArray(data) ? data : (data?.expenses || []));
                    break;
                }
              } else {
                const key = fetchKeys[index];
                console.error(`Failed to fetch ${key}:`, response.reason);
              }
            });
        
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
  
  const markAttendance = async (status: Attendance['status']) => {
    try {
      const response = await axios.post('/api/attendance', { status });
      const newAttendance: Attendance = response.data;
      setAttendance([...attendance, newAttendance]);
      return newAttendance;
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      throw error;
    }
  };

  // API integration helper functions
  const createExpense = async (data: { amount: number; description: string; projectId?: string; category?: string; receiptUrl?: string }) => {
    try {
      const response = await axios.post('/api/expenses', data);
      setExpenses([...expenses, response.data]);
      return response.data;
    } catch (error) {
      console.error("Failed to create expense:", error);
      throw error;
    }
  };

  const updateExpense = async (expenseId: string, data: { status: string }) => {
    try {
      const response = await axios.put(`/api/expenses/${expenseId}`, data);
      setExpenses(expenses.map(e => e.id === expenseId ? response.data : e));
      return response.data;
    } catch (error) {
      console.error("Failed to update expense:", error);
      throw error;
    }
  };

  const createLeave = async (data: { reason: string; date: string; type?: string }) => {
    try {
      const response = await axios.post('/api/leave', data);
      setLeaves([...leaves, response.data]);
      return response.data;
    } catch (error) {
      console.error("Failed to create leave:", error);
      throw error;
    }
  };

  const updateLeave = async (leaveId: string, data: { status: string }) => {
    try {
      const response = await axios.put(`/api/leave/${leaveId}`, data);
      setLeaves(leaves.map(l => l.id === leaveId ? response.data : l));
      return response.data;
    } catch (error) {
      console.error("Failed to update leave:", error);
      throw error;
    }
  };

  const createTask = async (data: { title: string; description?: string; projectId: string; status?: string; priority?: string; dueDate?: string; assigneeId?: string }) => {
    try {
      const response = await axios.post('/api/tasks', data);
      setTasks([...tasks, response.data]);
      return response.data;
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, data: any) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, data);
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
      return response.data;
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  };

  const createProject = async (data: { name: string; description?: string; leadId?: string }) => {
    try {
      const response = await axios.post('/api/projects', data);
      setProjects([...projects, response.data]);
      return response.data;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    }
  };

  const updateProject = async (projectId: string, data: any) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, data);
      setProjects(projects.map(p => p.id === projectId ? response.data : p));
      return response.data;
    } catch (error) {
      console.error("Failed to update project:", error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await axios.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Failed to delete project:", error);
      throw error;
    }
  };

  // Normalize current user's role to consistent casing for RBAC checks
  const normalizedRole = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1).toLowerCase()
    : undefined;

  const roleAccess = {
    canManageProjects: normalizedRole === "Admin",
    canManageTasks: normalizedRole ? ["Admin", "Member"].includes(normalizedRole) : false,
    canViewAnalytics: normalizedRole ? ["Admin", "Member", "Viewer"].includes(normalizedRole) : false,
    canManageTeam: normalizedRole === "Admin",
    canMarkAttendance: normalizedRole ? ["Admin", "Member"].includes(normalizedRole) : false,
    canManageExpenses: normalizedRole === "Admin",
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
    // API methods
    createExpense,
    updateExpense,
    createLeave,
    updateLeave,
    createTask,
    updateTask,
    deleteTask,
    createProject,
    updateProject,
    deleteProject,
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
