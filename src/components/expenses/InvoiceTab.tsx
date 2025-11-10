
"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InvoiceGenerator from "./InvoiceGenerator";

export default function InvoiceTab() {
  const { invoices } = useFinanceStore((state: any) => ({
    invoices: state.invoices,
  }));
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

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
              {invoices.map((i: any) => (
                <tr key={i.id} className="border-b">
                  <td className="p-2">{i.client}</td>
                  <td className="p-2">{i.date}</td>
                  <td className="p-2">₹{i.amount.toFixed(2)}</td>
                  <td
                    className={`p-2 font-medium ${
                      i.status === "Paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {i.status}
                  </td>
                </tr>
              ))}
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
