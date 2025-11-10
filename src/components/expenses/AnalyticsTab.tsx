
"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useApp } from "@/context/AppContext";

export default function AnalyticsTab() {
  const { expenses: allAppExpenses } = useApp();
  const { invoices } = useFinanceStore((state: any) => ({ invoices: state.invoices }));

  const totalExpense = allAppExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalRevenue = invoices
    .filter((i: any) => i.status === "Paid")
    .reduce((sum: number, i: any) => sum + i.amount, 0);

  const data = [
    { name: "This Month", Expense: totalExpense, Revenue: totalRevenue },
  ];

  return (
    <Card>
        <CardHeader>
            <CardTitle>📊 Company Growth — Expense vs Revenue</CardTitle>
        </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="Expense" fill="#f87171" />
            <Bar dataKey="Revenue" fill="#4ade80" />
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
