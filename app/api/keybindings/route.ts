import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongoose";
import KeyBinding from "@/lib/db/models/KeyBinding";
import { DEFAULT_BINDINGS } from "@/lib/keybindings/defaults";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    // Guest: return default bindings
    return Response.json({
      bindings: [DEFAULT_BINDINGS],
      source: "defaults",
    });
  }

  await connectDB();

  const docs = await KeyBinding.find({ userId }).sort({ updatedAt: -1 });

  if (docs.length === 0) {
    return Response.json({
      bindings: [DEFAULT_BINDINGS],
      source: "defaults",
    });
  }

  // Convert Mongoose Maps to plain objects
  const bindings = docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    isDefault: doc.isDefault,
    keyboard1: Object.fromEntries(doc.keyboard1),
    keyboard2: Object.fromEntries(doc.keyboard2),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));

  return Response.json({ bindings, source: "database" });
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { error: "Authentication required to save keybindings" },
      { status: 401 }
    );
  }

  const body = await req.json();

  if (!body.name || !body.keyboard1 || !body.keyboard2) {
    return Response.json(
      { error: "Missing required fields: name, keyboard1, keyboard2" },
      { status: 400 }
    );
  }

  await connectDB();

  // If an id is provided, update existing; otherwise create new
  if (body.id) {
    const doc = await KeyBinding.findOneAndUpdate(
      { _id: body.id, userId },
      {
        name: body.name,
        keyboard1: new Map(Object.entries(body.keyboard1)),
        keyboard2: new Map(Object.entries(body.keyboard2)),
        updatedAt: new Date(),
      },
      { returnDocument: 'after' }
    );

    if (!doc) {
      return Response.json({ error: "Keybinding not found" }, { status: 404 });
    }

    return Response.json({
      binding: {
        id: doc._id.toString(),
        name: doc.name,
        keyboard1: Object.fromEntries(doc.keyboard1),
        keyboard2: Object.fromEntries(doc.keyboard2),
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      },
    });
  }

  // Create new binding set
  const doc = await KeyBinding.create({
    userId,
    name: body.name,
    isDefault: false,
    keyboard1: new Map(Object.entries(body.keyboard1)),
    keyboard2: new Map(Object.entries(body.keyboard2)),
  });

  return Response.json({
    binding: {
      id: doc._id.toString(),
      name: doc.name,
      keyboard1: Object.fromEntries(doc.keyboard1),
      keyboard2: Object.fromEntries(doc.keyboard2),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    },
  });
}
