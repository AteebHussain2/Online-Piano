import mongoose, { Schema, Model } from "mongoose";

export interface IKeyBinding {
  userId: string;
  name: string;
  isDefault: boolean;
  keyboard1: Map<string, string>;
  keyboard2: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const KeyBindingSchema = new Schema<IKeyBinding>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  keyboard1: {
    type: Map,
    of: String,
    required: true,
  },
  keyboard2: {
    type: Map,
    of: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const KeyBinding: Model<IKeyBinding> =
  mongoose.models.KeyBinding ||
  mongoose.model<IKeyBinding>("KeyBinding", KeyBindingSchema);

export default KeyBinding;
