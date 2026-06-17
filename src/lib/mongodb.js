import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let clientPromise = null;

const OPTIONS = {
  serverSelectionTimeoutMS: 5000,  // fail fast if Atlas unreachable
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
};

export async function getDb() {
  if (!uri) return null;
  try {
    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        global._mongoClientPromise = new MongoClient(uri, OPTIONS).connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      if (!clientPromise) {
        clientPromise = new MongoClient(uri, OPTIONS).connect();
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
