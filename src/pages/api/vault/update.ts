// pages/api/vault/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongo";
import { VaultItem } from "../../../models/VaultItem";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).end();
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "no auth" });

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const { id, ciphertext, iv } = req.body;
    if (!id || (!ciphertext && !iv)) return res.status(400).json({ error: "missing" });

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "bad id" });

    await connectToDatabase();

    const update: any = {};
    if (ciphertext) update.ciphertext = ciphertext;
    if (iv) update.iv = iv;

    const updated = await VaultItem.findOneAndUpdate(
      { _id: id, userId: payload.userId },
      { $set: update },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ ok: true, id: updated._id });
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}


