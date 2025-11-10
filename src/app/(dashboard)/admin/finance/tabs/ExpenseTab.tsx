
"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ExpenseTab() {
  const expenses = useFinanceStore((state: any) => state.expenses);

  const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const approved = expenses.filter((e: any) => e.status === "Approved");
  const pending = expenses.filter((e: any) => e.status === "Pending");

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-2">Title</th>
              <th className="p-2">Department</th>
              <th className="p-2">Date</th>
              <th className="p-2">Amount (₹)</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e: any) => (
              <tr key={e.id} className="border-b">
                <td className="p-2">{e.title}</td>
                <td className="p-2">{e.dept}</td>
                <td className="p-2">{e.date}</td>
                <td className="p-2">{e.amount}</td>
                <td className="p-2">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">💸 Total Expense: ₹{total}</p>
        <div className="space-x-3">
          <Button variant="outline">Approved ({approved.length})</Button>
          <Button variant="outline">Pending ({pending.length})</Button>
        </div>
      </div>
    </div>
  );
}
