"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseTab from "./tabs/ExpenseTab";
import InvoiceTab from "./tabs/InvoiceTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import { motion } from "framer-motion";

export default function FinancePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <h1 className="text-2xl font-semibold">💼 Company Finance</h1>
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <ExpenseTab />
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
