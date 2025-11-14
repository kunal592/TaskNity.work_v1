// src/lib/requireUser.ts
import { NextResponse } from "next/server";
import { getCurrentDbUser } from "./getCurrentDbUser";

export async function requireUser(req: Request) {
  const user = await getCurrentDbUser(req);
  if (!user) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}
