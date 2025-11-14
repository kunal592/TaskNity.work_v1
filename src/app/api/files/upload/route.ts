// src/app/api/files/upload/route.ts
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import fs from "fs";
import path from "path";

/**
 * Simple base64 file upload endpoint:
 * Accepts JSON: { fileName: string, contentBase64: string, mimeType?: string }
 * Saves to /uploads/<timestamp>-<fileName> and returns a download URL.
 */
export const POST = withAuth(async (req: Request) => {
  await requirePermission(req, "file:upload");

  const { fileName, contentBase64 } = await req.json();
  if (!fileName || !contentBase64) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const filePath = path.join(uploadsDir, safeName);
  const buffer = Buffer.from(contentBase64, "base64");
  fs.writeFileSync(filePath, buffer, { mode: 0o600 });

  const url = `/uploads/${safeName}`; // serve via static file server or a custom handler

  return { id: safeName, url, size: buffer.length };
});
