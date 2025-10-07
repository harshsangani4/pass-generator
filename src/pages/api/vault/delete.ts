// pages/api/vault/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongo";
import { VaultItem } from "../../../models/VaultItem";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).end();
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "no auth" });

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const { id } = req.query;
    const itemId = Array.isArray(id) ? id[0] : id;
    if (!itemId) return res.status(400).json({ error: "missing id" });
    if (!mongoose.Types.ObjectId.isValid(itemId)) return res.status(400).json({ error: "bad id" });

    await connectToDatabase();

    const deleted = await VaultItem.findOneAndDelete({ _id: itemId, userId: payload.userId });
    if (!deleted) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}


