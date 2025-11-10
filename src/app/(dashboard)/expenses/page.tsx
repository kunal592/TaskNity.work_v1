"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseTab from "@/components/expenses/ExpenseTab";
import RevenueTab from "@/components/expenses/RevenueTab";
import AnalyticsTab from "@/components/expenses/AnalyticsTab";
import InvoiceTab from "@/components/expenses/InvoiceTab";
import { motion } from "framer-motion";

export default function ExpensesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      <h1 className="text-2xl font-semibold">💼 Company Expenses</h1>
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="expenses">All Expenses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <ExpenseTab />
        </TabsContent>

        <TabsContent value="revenue">
            <RevenueTab />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
