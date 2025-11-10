
"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InvoiceTab() {
  const invoices = useFinanceStore((state: any) => state.invoices);
  const totalRevenue = invoices
    .filter((i: any) => i.status === "Paid")
    .reduce((sum: number, i: any) => sum + i.amount, 0);

  return (
    <div className="space-y-4">
      <Card className="p-4">
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
                <td className="p-2">{i.amount}</td>
                <td className="p-2">{i.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">💵 Total Revenue: ₹{totalRevenue}</p>
        <Button>Generate Invoice</Button>
      </div>
    </div>
  );
}
