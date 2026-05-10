import mongoose, { Schema, Model } from "mongoose";

export interface IPianoSettings {
  userId: string;
  settings: Record<string, unknown>;
  updatedAt: Date;
}

const PianoSettingsSchema = new Schema<IPianoSettings>({
  userId: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  settings: {
    type: Object,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const PianoSettings: Model<IPianoSettings> =
  mongoose.models.PianoSettings ||
  mongoose.model<IPianoSettings>("PianoSettings", PianoSettingsSchema);

export default PianoSettings;
