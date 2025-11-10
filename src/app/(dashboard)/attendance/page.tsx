"use client";
import { useApp } from "@/context/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import AttendanceGraph from "@/components/profile/AttendanceGraph";
import { motion } from "framer-motion";

export default function AttendancePage() {
  const { currentUser, attendance, markAttendance, roleAccess } = useApp();

  if (!currentUser) {
    return <p className="p-6 text-muted-foreground">Loading attendance data...</p>;
  }

  if (!roleAccess.canMarkAttendance) {
    return <p className="text-red-500 p-4">You don’t have access to Attendance.</p>;
  }

  const today = new Date().toISOString().split("T")[0];
  const alreadyMarked = attendance.find(
    (a) => a.userId === currentUser.id && a.date === today
  );

  const userLogs = attendance.filter((a) => a.userId === currentUser.id);

  const recentAttendance = userLogs
    .slice(-7)
    .map((a) => ({ date: a.date.slice(5), value: a.status === "Present" ? 1 : 0.5 }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6"
    >
      <h2 className="text-2xl font-semibold">Attendance - {currentUser.name}</h2>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mark Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {alreadyMarked ? (
              <p className="text-green-600 font-medium">
                ✅ Already marked for today: {alreadyMarked.status}
              </p>
            ) : (
              <>
                <Button onClick={() => { markAttendance("Present"); toast.success("Marked Present"); }}>
                  Check In (Present)
                </Button>
                <Button variant="outline" onClick={() => { markAttendance("Remote"); toast.success("Marked Remote"); }}>
                  Work from Home (Remote)
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={recentAttendance}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} tickFormatter={(v) => (v >= 1 ? "Present" : "Remote/Absent")} />
                <Tooltip formatter={(value: any) => value >= 1 ? 'Present' : 'Remote/Absent'} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="text-muted-foreground border-b">
                  <tr>
                    <th className="py-2">Date</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userLogs.slice(-10).reverse().map((log) => (
                    <tr key={log.id} className="border-b last:border-none">
                      <td className="py-2">{log.date}</td>
                      <td className="py-2">{log.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <AttendanceGraph attendance={userLogs} />
      </div>
    </motion.div>
  );
}
