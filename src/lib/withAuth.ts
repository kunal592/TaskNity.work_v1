// src/lib/withAuth.ts
import { NextResponse } from "next/server";

/**
 * Wrap route handlers to normalize error handling.
 * Handler can:
 *  - return a NextResponse
 *  - return data (object/array/primitives) -> wrapped with NextResponse.json
 *  - throw a NextResponse (e.g., requirePermission throws NextResponse.json)
 *
 * Usage:
 * export const GET = withAuth(async (req, ctx) => { ... return data; });
 */
export function withAuth(handler: Function) {
  return async (req: Request, context?: any) => {
    try {
      const result = await handler(req, context);

      if (result instanceof NextResponse) return result;
      return NextResponse.json(result);
    } catch (err: any) {
      // If handler threw a NextResponse (e.g., requirePermission)
      if (err instanceof NextResponse) return err;

      console.error("API ERROR:", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
