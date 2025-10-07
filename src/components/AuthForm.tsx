import React, { useState } from "react";

export default function AuthForm({ title, actionLabel, onSubmit, footer }: { title: string; actionLabel: string; onSubmit: (email: string, password: string) => Promise<void>; footer?: React.ReactNode; }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err: any) {
      setError(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-5 rounded-lg border border-white/10 bg-black/10 backdrop-blur-sm flex flex-col gap-3">
        <h1 className="text-lg font-semibold">{title}</h1>
        <input className="px-3 py-2 rounded-md border border-white/10 bg-black/10" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="px-3 py-2 rounded-md border border-white/10 bg-black/10" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <div style={{ color: "#ef4444" }}>{error}</div>}
        <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition" type="submit" disabled={loading}>{loading ? `${actionLabel}...` : actionLabel}</button>
        {footer}
      </form>
    </div>
  );
}


