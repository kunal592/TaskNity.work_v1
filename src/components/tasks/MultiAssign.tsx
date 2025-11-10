"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { X } from "lucide-react";

interface MultiAssignProps {
  users: User[];
  selectedUsers: string[];
  onSelectedUsersChange: (userIds: string[]) => void;
}

export default function MultiAssign({ users, selectedUsers, onSelectedUsersChange }: MultiAssignProps) {

  const toggleSelect = (userId: string) => {
    onSelectedUsersChange(
      selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : [...selectedUsers, userId]
    );
  };

  return (
    <div className="space-y-2">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select Members" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-2 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                toggleSelect(user.id);
              }}
            >
              <Checkbox checked={selectedUsers.includes(user.id)} className="mr-2" />
              <span>{user.name}</span>
            </div>
          ))}
        </SelectContent>
      </Select>
      <div className="text-sm text-muted-foreground min-h-[20px]">
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedUsers.map(userId => {
                const user = users.find(u => u.id === userId);
                return (
                    <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                        {user?.name}
                        <button onClick={() => toggleSelect(userId)} className="rounded-full hover:bg-muted-foreground/20">
                            <X size={12} />
                        </button>
                    </Badge>
                )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
