"use client";
import { useApp } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";

export default function AnalyticsPage() {
  const { tasks, projects, roleAccess } = useApp();

  if (!roleAccess.canViewAnalytics) {
    return <p className="text-red-500 p-6">You don't have access to view analytics.</p>;
  }

  const taskStats = [
    { name: "To Do", value: tasks.filter((t) => t.status === "To Do").length },
    { name: "In Progress", value: tasks.filter((t) => t.status === "In Progress").length },
    { name: "Done", value: tasks.filter((t) => t.status === "Done").length },
  ];

  const projectStats = projects.map((p) => ({
    name: p.title.length > 15 ? `${p.title.substring(0, 15)}...` : p.title,
    progress: p.progress,
  }));

  const COLORS = ["#f87171", "#60a5fa", "#34d399"];

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={taskStats} dataKey="value" nameKey="name" outerRadius={100} label>
                {taskStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectStats}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
