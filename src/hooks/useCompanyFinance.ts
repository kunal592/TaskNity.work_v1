"use client";
import { useState } from "react";

export interface Invoice {
  id: number;
  employee: string;
  amount: number;
  status: "paid" | "pending";
  date: string;
}

export interface Salary {
  id: number;
  employee: string;
  base: number;
  bonus: number;
  total: number;
  role: string;
  lastPromotion: string;
}

export default function useCompanyFinance() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 1, employee: "Kunal Daharwal", amount: 5000, status: "paid", date: "2025-11-01" },
    { id: 2, employee: "Riya Sharma", amount: 4500, status: "pending", date: "2025-11-02" },
  ]);

  const [salaries, setSalaries] = useState<Salary[]>([
    { id: 1, employee: "Kunal Daharwal", base: 4000, bonus: 1000, total: 5000, role: "Team Lead", lastPromotion: "2025-09-10" },
    { id: 2, employee: "Riya Sharma", base: 3500, bonus: 500, total: 4000, role: "Developer", lastPromotion: "2025-07-01" },
  ]);

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => setInvoices(prev => [...prev, { ...invoice, id: prev.length + 1 }]);
  const updateSalary = (id: number, updates: Partial<Salary>) =>
    setSalaries(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));

  return { invoices, addInvoice, salaries, updateSalary };
}
