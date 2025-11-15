"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, ClipboardList, CheckCircle } from "lucide-react";

export default function NoticeBoard() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responded, setResponded] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get('/api/notices');
        const noticesData = Array.isArray(response.data) ? response.data : response.data?.notices || [];
        setNotices(noticesData);
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const handleFeedback = (id: string, feedback: string) => {
    setResponded(prev => ({
      ...prev,
      [id]: feedback
    }));
  };

  const feedbackOptions = ["Ok", "Understood", "I'm on it", "Will fix ASAP"];

  if (loading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Loading notices...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold tracking-tight mb-2">Admin Warnings & Assignments</h2>

      {notices.map((notice) => {
        const noticeType = notice.type || "assignment";
        const hasResponded = responded[notice.id];
        
        return (
          <Card
            key={notice.id}
            className={`border-l-4 ${
              noticeType === "warning"
                ? "border-l-red-500"
                : "border-l-blue-500"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                {noticeType === "warning" ? (
                  <AlertCircle className="text-red-500" size={18} />
                ) : (
                  <ClipboardList className="text-blue-500" size={18} />
                )}
                <CardTitle className="text-base font-medium">{notice.title || notice.content?.split('\n')[0]}</CardTitle>
              </div>
              <span className="text-xs text-muted-foreground">{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'N/A'}</span>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{notice.content}</p>

              {!hasResponded ? (
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
                    You replied: <b>{hasResponded}</b>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {notices.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          🎉 No warnings or assignments yet. Keep up the great work!
        </p>
      )}
    </motion.div>
  );
}
