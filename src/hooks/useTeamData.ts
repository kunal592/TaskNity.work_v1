// src/hooks/useTeamData.ts
"use client";

import { useEffect, useState, useCallback } from "react";

export interface Task {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "pending";
  date: string;
}

export interface TeamUser {
  id: string;
  name?: string | null;
  role?: "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER" | string;
  email: string;
  phone?: string | null;
  address?: string | null;
  team?: string | null;
  // keep salary/github/linkedin optional — UI may use them even if DB doesn't persist
  salary?: number | null;
  github?: string | null;
  linkedin?: string | null;
  joined?: string | null; // ISO date string (YYYY-MM-DD)
  avatarUrl?: string | null;
  tasks?: Task[];
  isActive?: boolean;
}

export default function useTeamData() {
  const [team, setTeam] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to fetch team: ${res.status}`);
      }
      const data = await res.json();
      // API returns { users: [...] }
      setTeam(Array.isArray(data.users) ? data.users : []);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const addTeamMember = useCallback(async (payload: Partial<TeamUser>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to create user: ${res.status}`);
      }
      const data = await res.json();
      if (data?.user) {
        // keep optional UI-only fields (salary, github, linkedin) if caller passed them
        const merged = { ...payload, ...data.user } as TeamUser;
        setTeam(prev => [merged, ...prev]);
        return merged;
      }
      return null;
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeamMember = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/team?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to delete user: ${res.status}`);
      }
      // remove from state
      setTeam(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    team,
    loading,
    error,
    fetchTeam,
    addTeamMember,
    deleteTeamMember,
  };
}
