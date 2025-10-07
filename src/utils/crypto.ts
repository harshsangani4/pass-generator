// utils/crypto.ts
export async function textToArrayBuffer(str: string) {
  return new TextEncoder().encode(str);
}
export function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
export function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function deriveKeyFromPassword(password: string, saltBase64: string, iterations = 200_000) {
  const salt = base64ToArrayBuffer(saltBase64);
  const pwKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({
    name: "PBKDF2",
    salt,
    iterations,
    hash: "SHA-256"
  }, pwKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  return key;
}

export async function encryptJSON(key: CryptoKey, obj: any) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return {
    ciphertext: arrayBufferToBase64(cipher),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

export async function decryptToJSON(key: CryptoKey, ciphertextBase64: string, ivBase64: string) {
  const ct = base64ToArrayBuffer(ciphertextBase64);
  const iv = base64ToArrayBuffer(ivBase64);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, ct);
  const txt = new TextDecoder().decode(plain);
  return JSON.parse(txt);
}
