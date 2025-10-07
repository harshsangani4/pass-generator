// models/User.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  pbkdf2Salt: string; // base64 salt used for deriving vault key
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  pbkdf2Salt: { type: String, required: true }, // server stores salt only
  createdAt: { type: Date, default: Date.now },
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model("User", UserSchema);
