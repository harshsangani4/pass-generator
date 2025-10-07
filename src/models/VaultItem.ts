// models/VaultItem.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  ciphertext: string; // base64 ciphertext
  iv: string; // base64 iv
  createdAt: Date;
  updatedAt: Date;
  // optionally store some non-sensitive metadata for sorting (e.g., lastUsed)
}

const VaultItemSchema = new Schema<IVaultItem>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  ciphertext: { type: String, required: true },
  iv: { type: String, required: true },
}, { timestamps: true });

export const VaultItem: Model<IVaultItem> = mongoose.models.VaultItem || mongoose.model("VaultItem", VaultItemSchema);
