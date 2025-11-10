"use client";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useApp } from "@/context/AppContext";

export default function Navbar() {
    const { currentUser } = useApp();
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm z-30 shadow-sm py-2 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            {/* The sidebar toggle is now part of the Sidebar component itself */}
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              {currentUser?.name} ({currentUser?.role})
            </span>
            <Button variant="ghost" size="icon">
                <LogOut size={16} />
            </Button>
        </div>
    </nav>
  );
}
