// src/app/api/files/[fileId]/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Simple file download route — serves files from /uploads.
 * Note: for production, use proper storage (S3) and signed URLs.
 */
export const GET = async (req: Request, { params }: any) => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadsDir, params.fileId);

  if (!fs.existsSync(filePath)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = fs.readFileSync(filePath);
  const res = new NextResponse(buffer);
  res.headers.set("Content-Type", "application/octet-stream");
  res.headers.set("Content-Length", String(buffer.length));
  res.headers.set("Content-Disposition", `attachment; filename="${params.fileId}"`);

  return res;
};
