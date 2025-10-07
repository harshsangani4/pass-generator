// components/VaultPanel.tsx
import React, { useEffect, useState } from "react";
import { deriveKeyFromPassword, decryptToJSON, encryptJSON } from "../utils/crypto";

type Item = { _id: string; ciphertext: string; iv: string; createdAt?: string; updatedAt?: string; decrypted?: any };

export default function VaultPanel({ userId, password, pbkdf2Salt }: { userId: string; password: string; pbkdf2Salt: string }) {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", username: "", password: "" });
  const [clipboardTimer, setClipboardTimer] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const k = await deriveKeyFromPassword(password, pbkdf2Salt);
      setKey(k);
      await loadItems(k);
    })();
  }, [password, pbkdf2Salt]);

  async function loadItems(derivedKey: CryptoKey) {
    const r = await fetch("/api/vault/list");
    if (!r.ok) return;
    const data = await r.json();
    const arr: Item[] = await Promise.all(data.items.map(async (it: any) => {
      let decrypted = null;
      try {
        decrypted = await decryptToJSON(derivedKey, it.ciphertext, it.iv);
      } catch (e) {
        decrypted = { error: "decrypt failed" };
      }
      return { ...it, decrypted };
    }));
    setItems(arr);
  }

  async function handleCreate(payload: any) {
    if (!key) return;
    const { ciphertext, iv } = await encryptJSON(key, payload);
    const r = await fetch("/api/vault/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ciphertext, iv }) });
    if (r.ok) await loadItems(key);
  }

  async function handleUpdate(id: string, payload: any) {
    if (!key) return;
    const { ciphertext, iv } = await encryptJSON(key, payload);
    const r = await fetch("/api/vault/update", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ciphertext, iv }) });
    if (r.ok) await loadItems(key);
  }

  async function handleDelete(id: string) {
    if (!key) return;
    const r = await fetch(`/api/vault/delete?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r.ok) await loadItems(key);
  }

  function copyAndAutoClear(text: string) {
    navigator.clipboard.writeText(text || "");
    if (clipboardTimer) clearTimeout(clipboardTimer);
    const ms = Number(process.env.NEXT_PUBLIC_CLIPBOARD_CLEAR_MS || 10000);
    const t = setTimeout(() => { navigator.clipboard.writeText(""); }, ms);
    setClipboardTimer(t);
  }

  function exportEncrypted() {
    const blob = new Blob([JSON.stringify(items.map(({ decrypted, ...rest }) => rest))], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vault-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importEncrypted(file: File) {
    const text = await file.text();
    try {
      const arr = JSON.parse(text);
      // Assume array of encrypted server items; just POST them back to server as-is? For safety, we'll refetch after upload flow. MVP keeps import client-side only for now.
      console.warn("Loaded encrypted items count:", Array.isArray(arr) ? arr.length : 0);
    } catch (e) {
      console.error("Import parse error", e);
    }
  }

  const visible = items.filter(it => {
    if (!search) return true;
    const s = search.toLowerCase();
    const d = JSON.stringify(it.decrypted || "").toLowerCase();
    return d.includes(s);
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap">
        <input className="px-3 py-2 rounded-md border border-white/10 bg-black/10 w-full sm:w-72" placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)} />
        <button className="px-3 py-2 rounded-md border border-white/20 hover:bg-white/5 transition" onClick={exportEncrypted}>Export</button>
        <label className="px-3 py-2 rounded-md border border-white/20 hover:bg-white/5 transition cursor-pointer">
          Import
          <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importEncrypted(f); }} />
        </label>
      </div>

      <div className="grid gap-2">
        <div className="p-3 rounded-lg border border-white/10 grid gap-2 sm:grid-cols-4">
          <input className="px-3 py-2 rounded-md border border-white/10 bg-black/10" placeholder="Title" value={form.title} onChange={e=>setForm(v=>({ ...v, title: e.target.value }))} />
          <input className="px-3 py-2 rounded-md border border-white/10 bg-black/10" placeholder="Username" value={form.username} onChange={e=>setForm(v=>({ ...v, username: e.target.value }))} />
          <input className="px-3 py-2 rounded-md border border-white/10 bg-black/10" placeholder="Password" value={form.password} onChange={e=>setForm(v=>({ ...v, password: e.target.value }))} />
          <button className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition" onClick={() => { handleCreate(form); setForm({ title: "", username: "", password: "" }); }}>Add</button>
        </div>
      </div>

      <div className="grid gap-3">
        {visible.map(it => (
          <div key={it._id} className="p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-base font-medium">{it.decrypted?.title ?? "—"}</div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded-md border border-white/20 hover:bg-white/5 transition" onClick={() => handleUpdate(it._id, it.decrypted)}>Save</button>
                <button className="px-2 py-1 rounded-md border border-red-400/40 text-red-300 hover:bg-red-400/10 transition" onClick={() => handleDelete(it._id)}>Delete</button>
              </div>
            </div>
            <div className="mt-1 text-sm opacity-80">user: {it.decrypted?.username}</div>
            <div className="mt-1 text-sm opacity-80">password: <code>{it.decrypted?.password ? "••••••" : "—"}</code>
              <button className="ml-2 px-2 py-1 rounded-md border border-white/20 hover:bg-white/5 transition" onClick={() => copyAndAutoClear(it.decrypted?.password || "")}>Copy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
