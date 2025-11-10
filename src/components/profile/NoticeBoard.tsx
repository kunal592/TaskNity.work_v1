"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, ClipboardList, CheckCircle } from "lucide-react";

export default function NoticeBoard() {
  // 🧠 Mock data representing notices/warnings from admin
  const [notices, setNotices] = useState([
    {
      id: 1,
      type: "warning",
      title: "Late Task Submission",
      message:
        "You submitted your Design Documentation 2 days late. Please adhere to deadlines in future.",
      date: "2025-11-01",
      feedback: "",
      status: "unread",
    },
    {
      id: 2,
      type: "assignment",
      title: "New Task Assigned - UI Fixes",
      message:
        "Fix the dashboard analytics layout and test responsiveness by end of this week.",
      date: "2025-11-02",
      feedback: "",
      status: "unread",
    },
  ]);

  const handleFeedback = (id: number, feedback: string) => {
    setNotices((prev) =>
      prev.map((notice) =>
        notice.id === id ? { ...notice, feedback, status: "responded" } : notice
      )
    );
  };

  const feedbackOptions = ["Ok", "Understood", "I'm on it", "Will fix ASAP"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold tracking-tight mb-2">Admin Warnings & Assignments</h2>

      {notices.map((notice) => (
        <Card
          key={notice.id}
          className={`border-l-4 ${
            notice.type === "warning"
              ? "border-l-red-500"
              : "border-l-blue-500"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {notice.type === "warning" ? (
                <AlertCircle className="text-red-500" size={18} />
              ) : (
                <ClipboardList className="text-blue-500" size={18} />
              )}
              <CardTitle className="text-base font-medium">{notice.title}</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">{notice.date}</span>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{notice.message}</p>

            {notice.status !== "responded" ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Send Feedback:</p>
                <div className="flex flex-wrap gap-2">
                  {feedbackOptions.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeedback(notice.id, option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="text-green-500" size={16} />
                <p className="text-xs text-green-600">
                  You replied: <b>{notice.feedback}</b>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {notices.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          🎉 No warnings or assignments yet. Keep up the great work!
        </p>
      )}
    </motion.div>
  );
}
