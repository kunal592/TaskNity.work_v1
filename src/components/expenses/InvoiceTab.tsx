
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InvoiceGenerator from "./InvoiceGenerator";

export default function InvoiceTab() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('/api/invoices');
        setInvoices(Array.isArray(response.data) ? response.data : response.data?.invoices || []);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <Button onClick={() => setIsGeneratorOpen(true)}>
            Generate Invoice
          </Button>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-2">Client</th>
                <th className="p-2">Date</th>
                <th className="p-2">Amount (₹)</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-2 text-center">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={4} className="p-2 text-center text-muted-foreground">No invoices found</td></tr>
              ) : (
                invoices.map((i: any) => (
                  <tr key={i.id} className="border-b">
                    <td className="p-2">{i.client || `Project ${i.projectId}`}</td>
                    <td className="p-2">{i.date || i.issuedAt ? new Date(i.issuedAt || i.date).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-2">₹{Number(i.amount).toFixed(2)}</td>
                    <td
                      className={`p-2 font-medium ${
                        (i.status === "Paid" || i.status === "PAID")
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {i.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <InvoiceGenerator
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
      />
    </>
  );
}
