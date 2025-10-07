// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", cookie.serialize("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: -1,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }));
  res.status(200).json({ ok: true });
}
