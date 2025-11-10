"use client";
import { useState } from "react";
import useAdminNotices from "@/hooks/useAdminNotices";
import NoticeStats from "@/components/admin/notices/NoticeStats";
import NoticeTable from "@/components/admin/notices/NoticeTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import UserProfileModal from "@/components/profile/UserProfileModal";

export default function AdminNoticesPage() {
  const { notices, deleteNotice } = useAdminNotices();
  const [search, setSearch] = useState("");
  const [profileUser, setProfileUser] = useState<number | null>(null);

  const filtered = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.member?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: notices.length,
    responded: notices.filter((n) => n.status === "responded").length,
    pending: notices.filter((n) => n.status === "pending").length,
    global: notices.filter((n) => n.scope === "global").length,
  };

  return (
    <div className="p-6 space-y-6">
      {profileUser !== null && (
        <UserProfileModal
          open={profileUser !== null}
          onClose={() => setProfileUser(null)}
          userId={profileUser}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Notices</h1>
        <Link href="/admin/notices/create">
          <Button>Create New Notice</Button>
        </Link>
      </div>

      <NoticeStats stats={stats} />

      <div className="flex justify-between items-center mb-3">
        <Input
          placeholder="Search by title or member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <NoticeTable
        notices={filtered}
        onEdit={(id) => alert("Edit Notice ID: " + id)}
        onDelete={(id) => deleteNotice(id)}
        onViewProfile={(id) => setProfileUser(id)}
      />
    </div>
  );
}
