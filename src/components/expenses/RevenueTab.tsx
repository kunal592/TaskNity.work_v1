
"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function RevenueTab() {
    const { invoices } = useFinanceStore((state: any) => ({
        invoices: state.invoices,
    }));
    
    const paidInvoices = invoices.filter((i: any) => i.status === "Paid");
    const pendingInvoices = invoices.filter((i: any) => i.status === "Pending");

    const totalRevenue = paidInvoices.reduce((sum: number, i: any) => sum + i.amount, 0);
    const pendingRevenue = pendingInvoices.reduce((sum: number, i: any) => sum + i.amount, 0);

    const revenueData = [
        { name: "Paid", value: totalRevenue },
        { name: "Pending", value: pendingRevenue },
    ];
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview: <span className="text-green-600 font-bold">₹{totalRevenue.toFixed(2)}</span></CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                        <Pie dataKey="value" data={revenueData} outerRadius={90} label>
                            {revenueData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Revenue Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                <table className="w-full text-sm">
                    <thead className="border-b text-muted-foreground">
                        <tr className="text-left">
                        <th className="p-2">Client/Product</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Amount (₹)</th>
                        <th className="p-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((i: any) => (
                        <tr key={i.id} className="border-b last:border-b-0">
                            <td className="p-2 font-medium">{i.client}</td>
                            <td className="p-2">{i.date}</td>
                            <td className="p-2">₹{i.amount.toFixed(2)}</td>
                            <td className={`p-2 font-medium ${i.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>{i.status}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
