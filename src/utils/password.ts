// utils/password.ts
export function generatePassword(opts: { length: number; lower: boolean; upper: boolean; numbers: boolean; symbols: boolean; excludeLookAlike: boolean; }) {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const syms = "!@#$%^&*()-_=+[]{};:,.<>/?";
  let chars = "";
  if (opts.lower) chars += lower;
  if (opts.upper) chars += upper;
  if (opts.numbers) chars += nums;
  if (opts.symbols) chars += syms;
  if (!chars) return "";

  if (opts.excludeLookAlike) {
    const lookalikes = "Il1O0";
    chars = chars.split("").filter(c => !lookalikes.includes(c)).join("");
  }

  let pw = "";
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < opts.length; i++) {
    pw += chars[arr[i] % chars.length];
  }
  return pw;
}
