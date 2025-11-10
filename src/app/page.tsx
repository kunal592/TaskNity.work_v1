"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UserProfileModal from "@/components/profile/UserProfileModal";

export default function HomePage() {
  const { projects } = useApp();
  const [profileUser, setProfileUser] = useState<number | null>(null);

  const userMap: { [key: string]: number } = {
    'user-1': 1,
    'user-2': 2,
    'user-3': 3,
    'user-4': 4,
  };

  const mapLegacyIdToNewId = (legacyId: string): number | undefined => {
     const userMapping: { [key: string]: number } = {
      "Alice Carter": 1,
      "Brian Lee": 2,
      "Chloe Patel": 3,
      "David Kim": 4,
    };
    const user = users.find(u => u.id === legacyId);
    return user ? userMapping[user.name] : undefined;
  }

  const { users } = useApp();

  const publicProjects = projects.filter(p => p.isPublic);

  return (
    <div className="space-y-8">
       {profileUser !== null && (
        <UserProfileModal
          open={profileUser !== null}
          onClose={() => setProfileUser(null)}
          userId={profileUser}
        />
      )}
      <motion.h2 
        className="text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Projects Overview
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {publicProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
          >
            <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-medium">{project.title}</CardTitle>
                <div className="flex -space-x-2">
                  <TooltipProvider>
                    {project.members.map(member => (
                      <Tooltip key={member.id}>
                        <TooltipTrigger asChild>
                           <Avatar 
                              className="border-2 border-card hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                              onClick={() => {
                                const newId = mapLegacyIdToNewId(member.id);
                                if (newId) setProfileUser(newId);
                              }}
                            >
                            <AvatarImage src={`https://i.pravatar.cc/150?img=${member.id.slice(-1)}`} alt={member.name} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{member.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow justify-end">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
