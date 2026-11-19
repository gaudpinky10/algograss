// The login cookie is base64 of UTF-8 JSON. atob() alone returns Latin-1, which
// garbles names like "Zoë" or "José" ("ZoÃ«"), so decode the bytes as UTF-8.
export function b64utf8(b64) {
  const bin = atob(b64)
  try { return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))) } catch { return bin }
}
