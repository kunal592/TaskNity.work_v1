
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useApp } from "@/context/AppContext";

export default function AnalyticsTab() {
  const { expenses: allAppExpenses } = useApp();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [invoicesRes, analyticsRes] = await Promise.all([
          axios.get('/api/invoices'),
          axios.get('/api/analytics')
        ]);
        
        const invoiceData = Array.isArray(invoicesRes.data) ? invoicesRes.data : invoicesRes.data?.invoices || [];
        setInvoices(invoiceData);
        setAnalyticsData(analyticsRes.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  const totalExpense = allAppExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const totalRevenue = invoices
    .filter((i: any) => i.status === "Paid" || i.status === "PAID")
    .reduce((sum: number, i: any) => sum + Number(i.amount), 0);

  const data = [
    { name: "This Month", Expense: totalExpense, Revenue: totalRevenue },
  ];

  return (
    <Card>
        <CardHeader>
            <CardTitle>📊 Company Growth — Expense vs Revenue</CardTitle>
        </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
