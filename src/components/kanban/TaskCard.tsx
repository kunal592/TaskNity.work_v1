"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Task, User } from "@/types";
import gsap from "gsap";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    task: Task;
    users: User[];
    onClick: () => void;
}

export default function TaskCard({ task, users, onClick }: Props) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: task.status === 'Done'
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const getUserById = (id: string): User | undefined => users.find(u => u.id === id);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50"
      >
        <Card className="border-2 border-primary cursor-grabbing">
            <CardHeader><CardTitle className="text-base">{task.title}</CardTitle></CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
    >
        <Card
            className={cn(
                "hover:shadow-lg transition-all flex flex-col",
                task.status === 'Done' 
                    ? "border-green-500 bg-green-50/50 cursor-not-allowed" 
                    : "cursor-grab",
                task.classified && "border-red-500 border-2 bg-red-500/5"
            )}
            onMouseEnter={(e) => task.status !== 'Done' && gsap.to(e.currentTarget, { y: -3, duration: 0.2 })}
            onMouseLeave={(e) => task.status !== 'Done' && gsap.to(e.currentTarget, { y: 0, duration: 0.2 })}
            onClick={onClick}
        >
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    {task.classified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {task.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex justify-between items-center">
                <Badge
                    variant={
                    task.priority === "High"
                        ? "destructive"
                        : task.priority === "Medium"
                        ? "secondary"
                        : "outline"
                    }
                >
                    {task.priority}
                </Badge>
                    <div className="flex -space-x-2">
                    <TooltipProvider>
                        {task.assignedTo.map(userId => {
                            const user = getUserById(userId);
                            if (!user) return null;
                            return (
                                <Tooltip key={user.id}>
                                    <TooltipTrigger asChild>
                                        <Avatar className="border-2 border-card hover:ring-2 hover:ring-primary transition-all cursor-pointer h-8 w-8">
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{user.name}</p></TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </TooltipProvider>
                </div>
            </CardContent>
            {task.deadline && (
                <CardFooter>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{task.deadline}</span>
                    </div>
                </CardFooter>
            )}
        </Card>
    </div>
  );
}
