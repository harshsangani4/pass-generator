// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongo";
import { User } from "../../../models/User";
import bcrypt from "bcrypt";
import { signJwt } from "../../../lib/jwt";
import cookie from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing" });

  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid" });

  const token = signJwt({ userId: user._id.toString(), email: user.email });

  res.setHeader("Set-Cookie", cookie.serialize("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }));

  // return the pbkdf2 salt so client can derive key
  return res.status(200).json({ ok: true, pbkdf2Salt: user.pbkdf2Salt, userId: user._id });
}
