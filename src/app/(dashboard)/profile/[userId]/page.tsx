"use client";
import { useParams } from "next/navigation";
import useUsersData from "@/hooks/useUsersData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { getUser } = useUsersData();
  const user = getUser(Number(userId));

  if (!user) return <p className="p-6 text-muted-foreground">User not found.</p>;

  const data = user.tasks.map(t => ({ name: t.title, status: t.status === "completed" ? 100 : t.status === "in-progress" ? 50 : 0 }));

  const completed = user.tasks.filter(t => t.status === "completed").length;
  const total = user.tasks.length;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm">Role: {user.role}</p>
          <p className="text-sm">Joined: {user.joined}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Task Overview</CardTitle></CardHeader>
        <CardContent>
          <Progress value={(completed / total) * 100} className="w-full mb-2" />
          <p className="text-sm text-muted-foreground">{completed}/{total} tasks completed</p>
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="status" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {user.tasks.map(t => (
              <li key={t.id} className="border-b pb-2">
                <span className="font-medium">{t.title}</span> — <span className="text-muted-foreground">{t.status}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
