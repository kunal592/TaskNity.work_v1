// src/lib/requirePermission.ts
import { NextResponse } from "next/server";
import { RBAC, Role, can } from "./rbac";
import { getCurrentDbUser } from "./getCurrentDbUser";

/**
 * Parse action like "task:update:own" into { base, own }
 */
function parseAction(action: string) {
  const parts = action.split(":");
  const own = parts[parts.length - 1] === "own";
  const base = own ? parts.slice(0, -1).join(":") : action;
  return { base, own };
}

/**
 * requirePermission - main helper used inside routes.
 *
 * - If user not logged in -> throws 401 NextResponse JSON
 * - If permission missing -> throws 403 NextResponse JSON
 * - If action ends with :own -> you should provide resourceFetcher in options which returns resource object
 *    (resource must contain owner field: createdBy | userId | ownerId or you can pass ownerKey)
 *
 * Returns: { user, resource? } if check passes.
 */
export async function requirePermission(
  req: Request,
  action: string,
  options?: {
    resourceFetcher?: (params?: any) => Promise<any | null | undefined>;
    params?: any;
    ownerKey?: string;
  }
) {
  const dbUser = await getCurrentDbUser(req);
  if (!dbUser) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { base, own } = parseAction(action);
  const rolePerms = (RBAC as any)[dbUser.role as Role] as Record<string, boolean> | undefined;

  // If no role definition
  if (!rolePerms) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // If exact action allowed (including :own)
  if (rolePerms[action] === true) {
    // if own-scoped, validate ownership using resourceFetcher
    if (own) {
      if (!options?.resourceFetcher) {
        // can't validate ownership -> reject
        throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const resource = await options.resourceFetcher(options.params);
      if (!resource) throw NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const ownerId =
        (options.ownerKey && (resource as any)[options.ownerKey]) ??
        resource.userId ??
        resource.ownerId ??
        resource.createdBy;

      if (ownerId && ownerId === dbUser.id) {
        return { user: dbUser, resource };
      }
      throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // non-own exact action allowed
    return { user: dbUser };
  }

  // If role has global/base permission (e.g., "task:update"), allow
  if (rolePerms[base] === true) {
    return { user: dbUser };
  }

  // No permission
  throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
