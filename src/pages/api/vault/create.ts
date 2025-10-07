// pages/api/vault/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongo";
import { VaultItem } from "../../../models/VaultItem";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "no auth" });

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const { ciphertext, iv } = req.body;
    if (!ciphertext || !iv) return res.status(400).json({ error: "missing" });

    await connectToDatabase();
    const item = await VaultItem.create({ userId: payload.userId, ciphertext, iv });
    return res.status(201).json({ ok: true, id: item._id });
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}
