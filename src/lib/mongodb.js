import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let clientPromise = null;

export async function getDb() {
  if (!uri) return null;
  try {
    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        global._mongoClientPromise = new MongoClient(uri).connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      if (!clientPromise) {
        clientPromise = new MongoClient(uri).connect();
      }
    }
    const c = await clientPromise;
    return c.db('algograss');
  } catch (err) {
    console.error('MongoDB connection error (non-fatal):', err.message);
    clientPromise = null;
    return null;
  }
}
