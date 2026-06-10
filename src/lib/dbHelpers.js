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
