"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GitMerge } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileModal from "../profile/UserProfileModal";

const RoleSection = ({ title, users, onUserClick }: { title: string; users: User[]; onUserClick: (userId: string) => void; }) => (
  <div className="text-center">
    <h3 className="text-lg font-semibold text-muted-foreground mb-4">{title}</h3>
    <div className="flex justify-center flex-wrap gap-6">
      {users.map((user) => (
        <div key={user.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onUserClick(user.id)}>
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
            <AvatarFallback>{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{user.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function OrgTree() {
  const { users } = useApp();
  const [profileUser, setProfileUser] = useState<string | null>(null);

  const admins = users.filter((u) => u.role === "Admin");
  const members = users.filter((u) => u.role === "Member");
  const viewers = users.filter((u) => u.role === "Viewer");
  
  const mapLegacyIdToNewId = (legacyId: string): number | undefined => {
    const user = users.find(u => u.id === legacyId);
    if (!user) return undefined;

    const userMapping: { [key: string]: number } = {
        "Alice Carter": 1,
        "Brian Lee": 2,
        "Chloe Patel": 3,
        "David Kim": 4,
    };
    return userMapping[user.name];
  }


  const handleUserClick = (userId: string) => {
    const newId = mapLegacyIdToNewId(userId);
    if(newId) setProfileUser(newId.toString());
  }

  return (
    <>
       {profileUser !== null && (
        <UserProfileModal
          open={profileUser !== null}
          onClose={() => setProfileUser(null)}
          userId={Number(profileUser)}
        />
      )}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <GitMerge />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Company Hierarchy</DialogTitle>
          </DialogHeader>
          <div className="space-y-12 py-6">
            {admins.length > 0 && <RoleSection title="Founders / Management" users={admins} onUserClick={handleUserClick} />}
            
            {admins.length > 0 && (members.length > 0 || viewers.length > 0) && (
                 <div className="flex justify-center">
                    <div className="w-px h-12 bg-border"></div>
                </div>
            )}

            {members.length > 0 && <RoleSection title="Team Members" users={members} onUserClick={handleUserClick} />}
            
            {members.length > 0 && viewers.length > 0 && (
                 <div className="flex justify-center">
                    <div className="w-px h-12 bg-border"></div>
                </div>
            )}
            
            {viewers.length > 0 && <RoleSection title="Viewers" users={viewers} onUserClick={handleUserClick} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
