import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import PianoSettings from "@/lib/db/models/PianoSettings";
import KeyBinding from "@/lib/db/models/KeyBinding";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get svix headers (headers() is async in Next.js 15+)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    console.error("Invalid webhook signature");
    return new Response("Invalid signature", { status: 400 });
  }

  await connectDB();

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    try {
      await User.create({
        clerkId: id,
        email,
      });
      console.log(`✅ User created: ${id}`);
    } catch (err) {
      console.error("Failed to create user:", err);
      return new Response("Failed to create user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      // Cascade delete: user + settings + keybindings
      await User.deleteOne({ clerkId: id });
      await PianoSettings.deleteMany({ userId: id });
      await KeyBinding.deleteMany({ userId: id });
      console.log(`✅ User deleted: ${id}`);
    } catch (err) {
      console.error("Failed to delete user:", err);
      return new Response("Failed to delete user", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}
