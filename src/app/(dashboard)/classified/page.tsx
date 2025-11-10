'use client';
import { useApp } from '@/context/AppContext';
import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function ClassifiedTasksPage() {
  const { tasks, users, roleAccess } = useApp();

  if (!roleAccess.canManageTeam) {
    return (
      <p className="p-6 text-red-500">
        Access Denied. You do not have permission to view this page.
      </p>
    );
  }

  const classifiedTasks = tasks.filter((task) => task.classified);

  const getTaskProgress = (task: Task) => {
    if (task.status === 'Done') return 100;
    if (task.status === 'In Progress') return 50;
    return 0;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">👁️ Classified Tasks Monitoring</h1>
      {classifiedTasks.length === 0 ? (
        <p className="text-muted-foreground">No classified tasks have been assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classifiedTasks.map((task) => {
            const assignedUser = users.find(u => task.assignedTo.includes(u.id));
            return (
              <Card key={task.id} className="border-red-500 border-2">
                <CardHeader>
                  <CardTitle className="text-red-600">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                     <p className="text-sm font-medium mb-2">Assigned To:</p>
                     {assignedUser ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${assignedUser.id}`} alt={assignedUser.name} />
                                <AvatarFallback>{assignedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{assignedUser.name}</span>
                        </div>
                     ): <p className="text-sm text-muted-foreground">No one assigned</p>}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Progress: <span className="font-bold">{task.status}</span></p>
                    <Progress value={getTaskProgress(task)} className="h-2 [&>div]:bg-red-500" />
                  </div>
                   {task.deadline && (
                    <p className="text-sm text-muted-foreground">Deadline: {task.deadline}</p>
                   )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
