"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalyticsTab() {
  const { expenses, invoices } = useFinanceStore((state: any) => ({ expenses: state.expenses, invoices: state.invoices }));

  const totalExpense = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalRevenue = invoices
    .filter((i: any) => i.status === "Paid")
    .reduce((sum: number, i: any) => sum + i.amount, 0);

  const data = [
    { name: "This Month", Expense: totalExpense, Revenue: totalRevenue },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">📊 Company Growth — Expense vs Revenue</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Expense" fill="#f87171" />
          <Bar dataKey="Revenue" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
