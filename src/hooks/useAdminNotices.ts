"use client";
import { useState } from "react";

export interface Notice {
  id: number;
  title: string;
  message: string;
  type: "warning" | "assignment";
  scope: "global" | "member";
  member?: string;
  date: string;
  status: "pending" | "responded";
  feedback?: string;
}

export default function useAdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: 1,
      title: "Late Task Submission",
      message: "Design documentation was submitted late.",
      type: "warning",
      scope: "member",
      member: "Kunal Daharwal",
      date: "2025-11-01",
      status: "responded",
      feedback: "Understood",
    },
    {
      id: 2,
      title: "New Assignment: UI Polish",
      message: "Refine the dashboard layout and improve chart visuals.",
      type: "assignment",
      scope: "global",
      date: "2025-11-02",
      status: "pending",
    },
  ]);

  const addNotice = (notice: Omit<Notice, 'id'>) =>
    setNotices((prev) => [...prev, { ...notice, id: prev.length + 1 }]);

  const updateNotice = (id: number, updated: Partial<Notice>) =>
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));

  const deleteNotice = (id: number) =>
    setNotices((prev) => prev.filter((n) => n.id !== id));

  return { notices, addNotice, updateNotice, deleteNotice };
}
