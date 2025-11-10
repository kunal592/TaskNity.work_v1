"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MeetingUI() {
  const [open, setOpen] = useState(false);
  const [member, setMember] = useState("");

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-2">Initiate Meeting</h2>
      <Input
        placeholder="Enter member name"
        value={member}
        onChange={(e) => setMember(e.target.value)}
      />
      <Button onClick={() => setOpen(true)} className="mt-3">Start Meeting</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Under Construction</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            The meeting initiation system is currently being built. Stay tuned 🚧
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
