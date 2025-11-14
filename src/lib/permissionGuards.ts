// src/lib/permissionGuards.ts
import { NextResponse } from "next/server";
import { can, RBAC, Role } from "./rbac";
import { getCurrentDbUser } from "./getCurrentDbUser";
import { prisma } from "./db";

/**
 * Resource shape we attempt to inspect for ownership.
 * You can extend this if your resources use different owner keys.
 */
type ResourceLike = { userId?: string; createdBy?: string; ownerId?: string } & Record<string, any>;

/**
 * Normalizes an action string and returns the "base" action and whether it's an "own" scoped action.
 * Examples:
 *  - "task:update" -> { base: "task:update", own: false }
 *  - "task:update:own" -> { base: "task:update", own: true }
 */
function parseAction(action: string) {
  const parts = action.split(":");
  const own = parts[parts.length - 1] === "own";
  const base = own ? parts.slice(0, -1).join(":") : action;
  return { base, own };
}

/**
 * Checks if the given role is allowed to perform action on a resource (optionally).
 * Rules:
 * 1) If RBAC[role][action] === true and action is NOT `:own` → allowed.
 * 2) If action is `:own`:
 *      - If RBAC[role][action] === true → allowed only if resource ownership check succeeds.
 *      - Else if RBAC[role][base] === true → allowed (role has global permission).
 * 3) Fallback: if RBAC[role][base] === true → allowed.
 */
export function hasPermissionAgainstResource(
  role: Role | string | undefined | null,
  action: string,
  resource?: ResourceLike
): boolean {
  if (!role) return false;

  const { base, own } = parseAction(action);
  const rolePerms = (RBAC as any)[role as Role] as Record<string, boolean> | undefined;

  if (!rolePerms) return false;

  // exact action allowed (e.g., "task:update:own" or "task:update")
  if (rolePerms[action] === true) {
    if (!own) return true;
    // own-scoped — require ownership
    return checkOwnership(resource);
  }

  // if role has base/global permission (e.g., "task:update") then allowed
  if (rolePerms[base] === true) return true;

  // no permission
  return false;
}

/**
 * Very small heuristic for ownership check:
 * accepts common owner keys: userId, ownerId, createdBy
 */
function checkOwnership(resource?: ResourceLike) {
  if (!resource) return false;
  // owner keys
  const owner = resource.userId ?? resource.ownerId ?? resource.createdBy;
  return !!owner; // caller must compare owner === user.id externally
}

/**
 * requirePermission to be used inside routes.
 *
 * @param req - the incoming Request object (passed to getCurrentDbUser)
 * @param action - action string (may end with :own)
 * @param options.resourceFetcher - optional async function that returns the resource for ownership checks.
 *        resourceFetcher receives the route params object (context.params) or a params object you pass.
 *
 * Throws NextResponse (401 or 403) on failure — so can be used with withAuth wrapper that returns thrown responses.
 *
 * Returns the dbUser (useful for creating/updating) and optionally the resource when fetched.
 */
export async function requirePermission(
  req: Request,
  action: string,
  options?: {
    // function to fetch resource for ownership checks: (params) => resource
    resourceFetcher?: (params?: any) => Promise<ResourceLike | null | undefined>;
    params?: any;
    // allow custom ownerKey mapping (if ownership is stored as e.g. 'leadId' vs 'userId')
    ownerKey?: string; // optional override for ownership key
  }
) {
  const dbUser = await getCurrentDbUser(req);
  if (!dbUser) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { base, own } = parseAction(action);

  // If the action is own-scoped and a resourceFetcher is provided, get the resource
  let resource: ResourceLike | undefined = undefined;
  if (own && options?.resourceFetcher) {
    resource = await options.resourceFetcher(options?.params);
    if (!resource) {
      // if we can't load resource for ownership check, deny
      throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // if ownerKey provided, normalize resource for checkOwnership
    if (options.ownerKey) {
      resource = { ...(resource as any), userId: (resource as any)[options.ownerKey] };
    }
  }

  // First, check if role has exact action (including :own)
  const rolePerms = (RBAC as any)[dbUser.role as Role] as Record<string, boolean> | undefined;

  if (rolePerms) {
    if (rolePerms[action] === true) {
      // if own action, verify ownership
      if (own) {
        // attempt to compare owner id with dbUser.id
        const ownerId = resource?.userId ?? resource?.ownerId ?? resource?.createdBy;
        if (ownerId && ownerId === dbUser.id) {
          return { user: dbUser, resource };
        } else {
          throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
      // allowed (non-own)
      return { user: dbUser, resource };
    }

    // if role has global/base permission (e.g. task:update) allow regardless of ownership
    if (rolePerms[base] === true) {
      return { user: dbUser, resource };
    }
  }

  // no permission
  throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
