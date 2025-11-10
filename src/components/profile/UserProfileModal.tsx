"use client";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useUsersData from "@/hooks/useUsersData";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function UserProfileModal({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: number; }) {
  const { users } = useApp();
  const { getUser } = useUsersData();
  
  // First, try to find by numeric ID from the old hook
  let user = getUser(userId);
  
  // If not found, try to find by string ID from the new context, mapping number to string
  if (!user) {
    const stringId = `user-${userId}`;
    const contextUser = users.find(u => u.id === stringId);
    // This part is tricky because the user object structures are different.
    // We'll proceed if we have the `user` from the old hook.
    // A proper fix would be to unify the data sources.
  }
  
  const router = useRouter();

  if (!user) {
    const tempUser = users.find(u => u.id === `user-${userId}`)
    if(!tempUser) return null;
    
    // Create a temporary user object that matches the `useUsersData` structure
    user = {
      id: userId,
      name: tempUser.name,
      email: tempUser.email,
      role: tempUser.role,
      joined: tempUser.joined,
      avatar: `https://i.pravatar.cc/150?u=${tempUser.id}`,
      tasks: [], // Task data is not available in AppContext users
      growth: 0, // Growth data is not available
      team: tempUser.team,
      salary: tempUser.salary
    };
  }


  const completed = user.tasks.filter(t => t.status === "completed").length;
  const total = user.tasks.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="mt-4">
            <CardContent className="space-y-4 p-4">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Joined:</strong> {user.joined}</p>
              { user.growth > 0 && <p><strong>Growth Rate:</strong> {user.growth}%</p>}

              { total > 0 && <div>
                <h4 className="font-semibold mb-1">Task Completion</h4>
                <Progress value={(completed / total) * 100} className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">{completed}/{total} tasks completed</p>
              </div>}

              <Button className="w-full mt-4" onClick={() => { router.push(`/profile/${user.id}`); onClose(); }}>
                View Full Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
