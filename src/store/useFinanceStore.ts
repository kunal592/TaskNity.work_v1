"use client";
import { create } from "zustand";

export const useFinanceStore = create((set, get) => ({
  expenses: [
    { id: 1, title: "Office Rent", dept: "Admin", date: "2025-10-01", amount: 2000, status: "Approved" },
    { id: 2, title: "Team Outing", dept: "HR", date: "2025-10-10", amount: 500, status: "Pending" },
    { id: 3, title: "Software License", dept: "IT", date: "2025-10-15", amount: 1200, status: "Approved" },
  ],
  invoices: [
    { id: 1, client: "ABC Corp", date: "2025-10-05", amount: 5000, status: "Paid" },
    { id: 2, client: "XZY Pvt Ltd", date: "2025-10-20", amount: 3000, status: "Pending" },
  ],
  addExpense: (expense: any) => set((state: any) => ({ expenses: [...state.expenses, expense] })),
  updateExpenseStatus: (id: any, status: any) =>
    set((state: any) => ({
      expenses: state.expenses.map((e: any) =>
        e.id === id ? { ...e, status } : e
      ),
    })),
  addInvoice: (invoice: any) => set((state: any) => ({ invoices: [...state.invoices, invoice] })),
}));
