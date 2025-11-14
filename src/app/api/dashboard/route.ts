// src/app/api/dashboard/route.ts
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";

/**
 * Convenience wrapper exposing dashboard cards (alias to /dashboard/stats).
 */
export const GET = withAuth(async (req: Request) => {
  await requirePermission(req, "dashboard:read");
  // forward to /api/dashboard/stats logic by fetching internally (or directly compute here)
  // Keep simple: redirect client to /api/dashboard/stats
  return new Response(JSON.stringify({ redirect: "/api/dashboard/stats" }), { status: 200 });
});
