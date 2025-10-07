// pages/api/vault/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongo";
import { VaultItem } from "../../../models/VaultItem";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "no auth" });

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    await connectToDatabase();
    const items = await VaultItem.find({ userId: payload.userId }).sort({ updatedAt: -1 }).lean();
    return res.status(200).json({ ok: true, items });
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}
