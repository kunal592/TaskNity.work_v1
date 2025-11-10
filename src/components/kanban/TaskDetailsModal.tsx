
"use client";
import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/context/AppContext";
import { Task, User } from "@/types";
import { CalendarIcon, Briefcase, Trophy, CheckCircle, FileText } from "lucide-react";

interface TaskDetailsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailsModal({ task, isOpen, onClose }: TaskDetailsModalProps) {
  const { users, projects, tasks: allTasks } = useApp();

  const project = projects.find(p => p.id === task.projectId);

  const assignedUsers = useMemo(() => {
    return users.filter(user => task.assignedTo.includes(user.id));
  }, [users, task.assignedTo]);

  const userContributions = useMemo(() => {
    const contributions: { [key: string]: number } = {};
    users.forEach(user => {
      contributions[user.id] = allTasks.filter(t => t.status === 'Done' && t.assignedTo.includes(user.id)).length;
    });
    return contributions;
  }, [users, allTasks]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
          <DialogDescription>
            In project: <span className="font-medium text-primary">{project?.title}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"
                }
              >
                {task.priority} Priority
              </Badge>
              <Badge variant={task.status === "Done" ? "default" : "outline"} className={task.status === "Done" ? "bg-green-600 text-white" : ""}>
                {task.status}
              </Badge>
            </div>
            {task.deadline && (
              <div className="flex items-center text-sm text-muted-foreground gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{task.deadline}</span>
              </div>
            )}
          </div>
          
          {task.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FileText size={18}/> Description</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{task.description}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg mb-3">Assigned Team</h3>
            <div className="space-y-3">
              {assignedUsers.map(user => (
                <div key={user.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                  <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold">{user.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Briefcase size={12}/> {user.role}</span>
                        <span className="flex items-center gap-1"><Trophy size={12}/> {user.team} Team</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary flex items-center gap-1">
                        <CheckCircle size={14}/> {userContributions[user.id] || 0}
                    </p>
                     <p className="text-xs text-muted-foreground">Tasks Done</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    