import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import PianoSettings from "@/lib/db/models/PianoSettings";
import { DEFAULT_SETTINGS } from "@/types/piano";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    // Guest: return defaults
    return Response.json({ settings: DEFAULT_SETTINGS, source: "defaults" });
  }

  await connectDB();

  const doc = await PianoSettings.findOne({ userId });
  if (!doc) {
    return Response.json({ settings: DEFAULT_SETTINGS, source: "defaults" });
  }

  return Response.json({ settings: doc.settings, source: "database" });
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { error: "Authentication required to save settings" },
      { status: 401 }
    );
  }

  const body = await req.json();

  if (!body.settings || typeof body.settings !== "object") {
    return Response.json({ error: "Invalid settings data" }, { status: 400 });
  }

  await connectDB();

  const doc = await PianoSettings.findOneAndUpdate(
    { userId },
    {
      userId,
      settings: body.settings,
      updatedAt: new Date(),
    },
    { upsert: true, returnDocument: 'after' }
  );

  return Response.json({ settings: doc.settings, source: "database" });
}
