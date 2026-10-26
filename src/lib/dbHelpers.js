import { getDb } from './mongodb';
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export { getDb };

// ─── Passwords ───────────────────────────────────────────────────────────────
// New passwords use scrypt with a random salt per user. Older accounts were
// stored as a single SHA-256 hash; they still log in, and their password is
// re-saved in the new format on their next login (see needsRehash).
const LEGACY_SALT = 'algograss_salt_2025';
const sameBytes = (a, b) => a.length === b.length && timingSafeEqual(a, b);

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(String(password), salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function checkPassword(password, stored) {
  if (!password || !stored || typeof stored !== 'string') return false;
  try {
    if (stored.startsWith('scrypt$')) {
      const [, salt, hash] = stored.split('$');
      return sameBytes(scryptSync(String(password), Buffer.from(salt, 'hex'), 64), Buffer.from(hash, 'hex'));
    }
    const legacy = createHash('sha256').update(String(password) + LEGACY_SALT).digest('hex');
    return sameBytes(Buffer.from(legacy), Buffer.from(stored));
  } catch { return false; }
}

export function needsRehash(stored) {
  return typeof stored === 'string' && !stored.startsWith('scrypt$');
}

// ─── Database ────────────────────────────────────────────────────────────────
// Makes sure a collection deletes old records automatically (once per server)
const ttlDone = new Set();
export function ensureTtl(col, field, seconds) {
  try {
    const key = `${col.collectionName}:${field}`;
    if (!col || ttlDone.has(key)) return;
    ttlDone.add(key);
    col.createIndex({ [field]: 1 }, { expireAfterSeconds: seconds, name: `ttl_${field}_${seconds}` }).catch(() => {});
  } catch {}
}

export async function getCollection(name) {
  const db = await getDb();
  if (!db) return null;
  return db.collection(name);
}

// Central activity tracker — call this from every API route
export async function trackActivity({ userEmail, tool, action, detail = '', meta = {}, ip = '' }) {
  try {
    const col = await getCollection('activities');
    if (!col) return;
    ensureTtl(col, 'createdAt', 90 * 86400); // activity logs are kept for 90 days
    await col.insertOne({
      userEmail: userEmail || 'anonymous',
      tool,
      action,
      detail,
      meta,
      ip,
      createdAt: new Date(),
    });
  } catch {} // never throw — tracking is non-fatal
}

// ─── Sessions ────────────────────────────────────────────────────────────────
// The login cookie (algograss_user) is base64 JSON, so pages can read the
// user's name and plan. It carries an expiry and a signature made with a
// server-only secret: a cookie that was written or changed by anyone else
// fails the check and is treated as logged out.
export const SESSION_COOKIE = 'algograss_user';
const SESSION_DAYS = 30;

let secretCache = null;
function sessionSecret() {
  if (secretCache) return secretCache;
  const base = process.env.SESSION_SECRET || process.env.MONGODB_URI || process.env.ANTHROPIC_API_KEY;
  // Without any server secret, sessions last only as long as this server instance
  secretCache = base ? createHash('sha256').update('algograss-session-v1\n' + base).digest() : randomBytes(32);
  return secretCache;
}

const canonical = obj => JSON.stringify(Object.keys(obj).sort().reduce((acc, k) => { acc[k] = obj[k]; return acc; }, {}));
const signPayload = payload => createHmac('sha256', sessionSecret()).update(canonical(payload)).digest('base64url');

// Builds the cookie value for a logged-in user
export function createSessionValue(user) {
  const payload = {};
  for (const k of ['id', 'name', 'email', 'plan', 'website', 'isAdmin', 'avatar']) {
    if (user?.[k] !== undefined && user?.[k] !== null) payload[k] = user[k];
  }
  payload.email = String(payload.email || '').toLowerCase();
  payload.exp = Date.now() + SESSION_DAYS * 864e5;
  return Buffer.from(JSON.stringify({ ...payload, sig: signPayload(payload) })).toString('base64');
}

export const sessionCookieOptions = () => ({
  httpOnly: false, // pages read the name and plan; the signature stops tampering
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: SESSION_DAYS * 24 * 60 * 60,
  path: '/',
});

// Returns the user only if the cookie is genuine and not expired, else null
export function parseUserCookie(cookieValue) {
  try {
    if (!cookieValue) return null;
    const obj = JSON.parse(Buffer.from(decodeURIComponent(String(cookieValue)), 'base64').toString());
    if (!obj || typeof obj !== 'object') return null;
    const { sig, ...payload } = obj;
    if (typeof sig !== 'string' || !sameBytes(Buffer.from(sig), Buffer.from(signPayload(payload)))) return null;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    if (!payload.email) return null;
    return payload;
  } catch { return null; }
}

// The logged-in user for this request, or null. Call only from route handlers.
export function getSessionUser(cookieStore) {
  try {
    const c = cookieStore?.get?.(SESSION_COOKIE);
    return c ? parseUserCookie(c.value) : null;
  } catch { return null; }
}
