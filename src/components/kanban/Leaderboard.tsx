"use client";
import { useMemo } from 'react';
import { User, Task } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
  tasks: Task[];
  onUserClick: (userId: string) => void;
}

export default function Leaderboard({ users, tasks, onUserClick }: LeaderboardProps) {
  const userContributions = useMemo(() => {
    const contributions: { [key: string]: number } = {};

    users.forEach(user => {
      contributions[user.id] = 0;
    });

    tasks.forEach(task => {
      if (task.status === 'Done') {
        task.assignedTo.forEach(userId => {
          if (contributions[userId] !== undefined) {
            contributions[userId]++;
          }
        });
      }
    });

    return users
      .map(user => ({
        ...user,
        completedTasks: contributions[user.id] || 0,
      }))
      .sort((a, b) => b.completedTasks - a.completedTasks);
      
  }, [users, tasks]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">🏆 Top Contributors</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {userContributions.map((user, index) => (
            <li
              key={user.id}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onUserClick(user.id)}
            >
              <span className="font-bold text-lg w-6 text-center">
                {index === 0 ? <Crown className="w-5 h-5 text-yellow-500" /> : index + 1}
              </span>
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="font-medium text-sm hover:underline">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.completedTasks} tasks completed</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
