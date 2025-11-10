"use client";
import { useApp } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/types";
import NoticeBoard from "@/components/profile/NoticeBoard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export default function ProfilePage() {
  const { currentUser, tasks, setTasks } = useApp();

  if (!currentUser) {
    return (
      <div className="p-4">
        <p>Loading profile...</p>
      </div>
    );
  }

  const handleCompleteTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: "Done" } : task
      )
    );
  };

  const userTasks = tasks.filter((t: Task) => t.assignedTo.includes(currentUser.id));
  const completed = userTasks.filter((t: Task) => t.status === "Done").length;
  const total = userTasks.length;
  const growthRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-semibold">Profile - {currentUser.name}</h2>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">Task Completion Rate</p>
          <div className="flex items-center gap-4">
            <Progress value={growthRate} className="h-3" />
            <span className="font-semibold">{growthRate}%</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Completed {completed} of {total} tasks</p>
        </CardContent>
      </Card>

      <NoticeBoard />

      <Card>
        <CardHeader>
          <CardTitle>Work History</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-3">
            {userTasks.map((t: Task) => (
              <li
                key={t.id}
                className={cn(
                  "flex justify-between items-center border-b pb-2",
                  t.classified && "border-l-4 border-l-red-500 pl-3 bg-red-500/5 rounded-r-md"
                )}
              >
                <span className="flex items-center gap-2">
                    {t.classified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <span className="font-medium">{t.title}</span>
                </span>
                <div className="flex items-center gap-4">
                    <span className="text-muted-foreground font-medium">{t.status}</span>
                    {t.status !== 'Done' && (
                        <Button size="sm" onClick={() => handleCompleteTask(t.id)}>Complete</Button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
