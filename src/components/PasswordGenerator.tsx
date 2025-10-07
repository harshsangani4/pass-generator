// components/PasswordGenerator.tsx
import React, { useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import { generatePassword } from "@/utils/password";

export default function PasswordGenerator({ onPick }: { onPick?: (pw: string) => void }) {
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeLookAlike, setExcludeLookAlike] = useState(true);
  const [value, setValue] = useState(() => generatePassword({ length, lower, upper, numbers, symbols, excludeLookAlike }));

  function regen() {
    const pw = generatePassword({ length, lower, upper, numbers, symbols, excludeLookAlike });
    setValue(pw);
    onPick?.(pw);
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <input className="flex-1 p-2 border rounded" value={value} readOnly />
        <button onClick={() => { navigator.clipboard.writeText(value); /* auto clear handled elsewhere */ }} title="Copy"><FaRegCopy /></button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label>Length: {length}<input type="range" min={8} max={64} value={length} onChange={(e)=>{ setLength(+e.target.value); }} /></label>
        <div>
          <label><input type="checkbox" checked={lower} onChange={(e)=>setLower(e.target.checked)} /> lower</label>
          <label><input type="checkbox" checked={upper} onChange={(e)=>setUpper(e.target.checked)} /> upper</label>
          <label><input type="checkbox" checked={numbers} onChange={(e)=>setNumbers(e.target.checked)} /> numbers</label>
          <label><input type="checkbox" checked={symbols} onChange={(e)=>setSymbols(e.target.checked)} /> symbols</label>
          <label><input type="checkbox" checked={excludeLookAlike} onChange={(e)=>setExcludeLookAlike(e.target.checked)} /> exclude look-alike</label>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={regen} className="btn">Regenerate</button>
        <button onClick={() => onPick?.(value)} className="btn-secondary">Use this</button>
      </div>
    </div>
  );
}
