import { headers } from "next/headers";
import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = await headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event;

  try {
    event = wh.verify(payload, svixHeaders) as any;
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  // Auto-create user
  if (type === "user.created") {
    await prisma.user.create({
      data: {
        clerkId: data.id,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email_addresses?.[0]?.email_address,
        role: "MEMBER",
      },
    });
  }

  return NextResponse.json({ status: "ok" });
}
