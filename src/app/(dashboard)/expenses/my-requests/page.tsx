
"use client";
import { useApp } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import toast from "react-hot-toast";
import { Expense } from "@/types";

export default function MyRequests() {
  const { currentUser, expenses, expenseCategories } = useApp();
  
  const [requests, setRequests] = useState<Expense[]>(
    currentUser ? expenses.filter((e) => e.requestedBy === currentUser.name) : []
  );
  const [form, setForm] = useState({ title: "", category: "", amount: "" });

  if (!currentUser) {
    return <p className="text-red-500 p-4">Please log in to see your requests.</p>;
  }

  const submitRequest = () => {
    if (!form.title || !form.amount || !form.category) {
      toast.error("Please fill all fields");
      return;
    }
    const newRequest: Expense = {
      id: Date.now().toString(),
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      requestedBy: currentUser.name,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    setRequests([...requests, newRequest]);
    toast.success("Request submitted");
    setForm({ title: "", category: "", amount: "" });
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-semibold">My Reimbursement Requests</h2>

      <Card>
        <CardHeader><CardTitle>Submit New Request</CardTitle></CardHeader>
        <CardContent className="space-y-3 max-w-sm">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select onValueChange={(v) => setForm({ ...form, category: v })} value={form.category}>
            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
            <SelectContent>
              {expenseCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Button onClick={submitRequest}>Submit</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>My Requests</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="p-2">Title</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b last:border-none">
                    <td className="p-2">{r.title}</td>
                    <td className="p-2">{r.category}</td>
                    <td className="p-2">₹{r.amount.toFixed(2)}</td>
                    <td className="p-2">{r.date}</td>
                    <td className={`p-2 ${r.status === "Approved" ? "text-green-600" : r.status === "Pending" ? "text-yellow-600" : "text-red-600"}`}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
