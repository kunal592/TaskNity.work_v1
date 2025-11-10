"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import type { Notice } from "@/hooks/useAdminNotices";

export default function NoticeTable({
  notices,
  onEdit,
  onDelete,
  onViewProfile,
}: {
  notices: Notice[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewProfile: (id: number) => void;
}) {

  const userMap: { [key: string]: number } = {
    "Kunal Daharwal": 1,
    "Riya Sharma": 2,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="overflow-x-auto rounded-md border shadow-sm"
    >
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Scope</th>
            <th className="p-3 text-left">Member</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((n) => (
            <tr key={n.id} className="border-b hover:bg-muted/30">
              <td className="p-3">{n.title}</td>
              <td className="p-3 capitalize">{n.type}</td>
              <td className="p-3 capitalize">{n.scope}</td>
              <td className="p-3">
                {n.scope === "member" && n.member ? (
                  <span onClick={() => onViewProfile(userMap[n.member!])} className="text-blue-600 hover:underline cursor-pointer">
                    {n.member}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    n.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {n.status}
                </span>
              </td>
              <td className="p-3 text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(n.id)}>
                  <Edit size={14} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(n.id)}>
                  <Trash2 size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {notices.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No notices found.
        </p>
      )}
    </motion.div>
  );
}
