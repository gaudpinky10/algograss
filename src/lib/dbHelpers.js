import { getDb } from './mongodb';
import { createHash } from 'crypto';

export function hashPassword(password) {
  return createHash('sha256').update(password + 'algograss_salt_2025').digest('hex');
}

export function checkPassword(password, hash) {
  return hashPassword(password) === hash;
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

// Get user from cookie string
export function parseUserCookie(cookieValue) {
  try { return JSON.parse(Buffer.from(cookieValue, 'base64').toString()); }
  catch { return null; }
}
