"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Home, BarChart2, Users, CreditCard, CalendarDays, LogOut, Trello, ChevronRight, Menu, AlertTriangle, Briefcase, DollarSign, Eye, FolderKanban, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { currentUser, roleAccess } = useApp();

  const navItems = [
    { label: "Dashboard", href: "/", icon: <Home size={18} /> },
    { label: "Tasks", href: "/tasks", icon: <Trello size={18} />, access: roleAccess.canManageTasks },
    { label: "Projects", href: "/projects", icon: <FolderKanban size={18} />, access: roleAccess.canManageProjects },
    { label: "Analytics", href: "/analytics", icon: <BarChart2 size={18} />, access: roleAccess.canViewAnalytics },
    { label: "Attendance", href: "/attendance", icon: <CalendarDays size={18} />, access: roleAccess.canMarkAttendance },
    { label: "Leave Management", href: "/leave-status", icon: <ClipboardCheck size={18} />, access: roleAccess.canManageTeam },
    { label: "Profile", href: "/profile", icon: <Users size={18} /> },
    { label: "Expenses", href: "/expenses", icon: <CreditCard size={18} />, access: roleAccess.canManageExpenses },
    { label: "My Requests", href: "/expenses/my-requests", icon: <CreditCard size={18} />, access: !roleAccess.canManageExpenses },
    { label: "Admin Notices", href: "/admin/notices", icon: <AlertTriangle size={18} />, access: roleAccess.canManageTeam },
    { label: "Team", href: "/admin/team", icon: <Briefcase size={18} />, access: roleAccess.canManageTeam },
    { label: "Finance", href: "/admin/finance", icon: <DollarSign size={18} />, access: roleAccess.canManageTeam },
    { label: "Classified", href: "/classified", icon: <Eye size={18} />, access: roleAccess.canManageTeam }
  ];

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setOpen(!open)}
          className="rounded-full shadow-lg"
        >
          {open ? <ChevronRight size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="sidebar"
            initial={{ x: -250, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed left-0 top-0 h-full w-64 bg-card border-r shadow-2xl z-40 flex flex-col justify-between"
          >
            <div className="p-5 mt-12 space-y-8">
              <h2 className="text-xl font-bold tracking-tight text-primary">TaskNity.Work</h2>

              <nav className="flex flex-col space-y-2">
                {navItems.filter(item => item.access !== false).map((item) => (
                  <Link key={item.href} href={item.href} passHref>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-sm font-medium hover:bg-muted"
                      onClick={() => setOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-4 border-t flex items-center gap-3">
               <div className="flex-grow">
                 <p className="text-sm font-semibold">{currentUser?.name}</p>
                 <p className="text-xs text-muted-foreground">{currentUser?.role}</p>
               </div>
              <Button variant="outline" size="icon">
                <LogOut size={16} />
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
