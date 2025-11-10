"use client";
import { useState } from "react";
import useAdminNotices, { Notice } from "@/hooks/useAdminNotices";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateNoticePage() {
  const { addNotice } = useAdminNotices();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "warning" as "warning" | "assignment",
    scope: "member" as "global" | "member",
    member: "",
  });

  const handleSubmit = () => {
    if (!form.title || !form.message) return alert("Fill all fields!");
    addNotice({
      ...form,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    } as Omit<Notice, 'id'>);
    router.push("/admin/notices");
  };

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle>Create New Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={form.type}
              onValueChange={(v: "warning" | "assignment") => setForm({ ...form, type: v })}
            >
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.scope}
              onValueChange={(v: "global" | "member") => setForm({ ...form, scope: v })}
            >
              <SelectTrigger><SelectValue placeholder="Scope" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.scope === "member" && (
            <Input
              placeholder="Member Name"
              value={form.member}
              onChange={(e) => setForm({ ...form, member: e.target.value })}
            />
          )}
          <Button onClick={handleSubmit} className="w-full">
            Create Notice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
