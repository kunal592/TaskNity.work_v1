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
