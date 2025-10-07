// pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongo";
import { User } from "../../../models/User";
import bcrypt from "bcrypt";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  await connectToDatabase();
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "User exists" });

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // generate PBKDF2 salt (client uses it to derive vault key)
  const pbkdf2Salt = crypto.randomBytes(16).toString("base64");

  const user = await User.create({ email, passwordHash, pbkdf2Salt });
  return res.status(201).json({ ok: true, pbkdf2Salt, userId: user._id });
}
