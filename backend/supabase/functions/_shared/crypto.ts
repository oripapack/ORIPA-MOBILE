/** Web Crypto helpers for provably fair pulls (Edge-safe). */

export function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error("Invalid hex length");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export async function sha256HexUtf8(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hash));
}

export async function hmacSha256HexUtf8(
  keyBytes: Uint8Array,
  message: string,
): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(message),
  );
  return bytesToHex(new Uint8Array(sig));
}

export function rollUint32FromDigestHex(digestHex: string): number {
  const slice = digestHex.slice(0, 8);
  return parseInt(slice, 16) >>> 0;
}

/** Big-endian uint32 at byte offset (reads 4 bytes). */
export function readUint32BE(bytes: Uint8Array, offset: number): number {
  const b0 = bytes[offset]! << 24;
  const b1 = bytes[offset + 1]! << 16;
  const b2 = bytes[offset + 2]! << 8;
  const b3 = bytes[offset + 3]!;
  return (b0 | b1 | b2 | b3) >>> 0;
}
