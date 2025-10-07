"use client";
import React, { useEffect, useMemo, useState } from "react";
import VaultPanel from "../components/VaultPanel";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [pbkdf2Salt, setPbkdf2Salt] = useState<string | null>(null);

  useEffect(() => {
    setUserId(sessionStorage.getItem("userId"));
    setPassword(sessionStorage.getItem("password"));
    setPbkdf2Salt(sessionStorage.getItem("pbkdf2Salt"));
  }, []);

  const authed = useMemo(() => !!userId && !!password && !!pbkdf2Salt, [userId, password, pbkdf2Salt]);

  return (
    <div className="min-h-screen p-4">
      <header className="mx-auto max-w-5xl flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Password Vault</h1>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/5 transition" onClick={() => {
            const html = document.documentElement;
            // Always set dark as requested
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
          }}>Toggle Dark</button>
          <a className="px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/5 transition" href="/login">Login</a>
          <a className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition" href="/signup">Signup</a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl">
        {!authed ? (
          <div className="rounded-lg border border-white/10 p-6 text-sm opacity-90">
            Please login. Your session-derived key is needed to decrypt.
          </div>
        ) : (
          <VaultPanel userId={userId!} password={password!} pbkdf2Salt={pbkdf2Salt!} />
        )}
      </main>
    </div>
  );
}
