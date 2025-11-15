"use client";
import { useApp } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import toast from "react-hot-toast";
import { Expense } from "@/types";

export default function ExpenseTab() {
  const { currentUser, roleAccess, expenses, expenseCategories, createExpense } = useApp();
  const [allExpenses, setAllExpenses] = useState(expenses);
  const [newExpense, setNewExpense] = useState({ title: "", category: "", amount: "", projectId: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser || !roleAccess.canManageExpenses) {
    return <p className="text-red-500 p-4">Access denied. Admin only.</p>;
  }

  const addExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) {
      toast.error("Fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const createdExpense = await createExpense({
        amount: parseFloat(newExpense.amount),
        description: newExpense.title,
        category: newExpense.category,
        projectId: newExpense.projectId || undefined,
      });
      
      setAllExpenses([...allExpenses, createdExpense]);
      toast.success("Expense added!");
      setNewExpense({ title: "", category: "", amount: "", projectId: "" });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Expenses</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} />
              <Select onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Amount" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} />
              <Button onClick={addExpense} disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-muted-foreground border-b">
              <tr >
                <th className="p-2">Title</th>
                <th className="p-2">Category</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Date</th>
                <th className="p-2">Requested By</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {allExpenses.map((exp) => (
                <tr key={exp.id} className="border-b last:border-none">
                  <td className="p-2">{exp.title}</td>
                  <td className="p-2">{exp.category}</td>
                  <td className="p-2">₹{Number(exp.amount).toFixed(2)}</td>
                  <td className="p-2">{exp.date}</td>
                  <td className="p-2">{exp.requestedBy}</td>
                  <td className={`p-2 ${exp.status === "Approved" ? "text-green-600" : exp.status === "Pending" ? "text-yellow-600" : "text-red-600"}`}>{exp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}