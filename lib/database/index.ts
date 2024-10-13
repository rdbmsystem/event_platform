import mongoose, { Connection } from "mongoose";

// Define an interface for the cached object
interface Cached {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Use globalThis for type-safe global access
const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: Cached;
};

// Define cached object or initialize if it doesn't exist
const cached: Cached = globalWithMongoose.mongoose || {
  conn: null,
  promise: null,
};

export const connectToDatabase = async (): Promise<Connection> => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) throw new Error("Database connection is missing");

  // If the promise doesn't exist, create a new one and use the mongoose.connection
  cached.promise =
    cached.promise ||
    mongoose
      .connect(MONGODB_URI, {
        dbName: "evently",
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance.connection); // Access the connection object

  cached.conn = await cached.promise;

  // Store cached connection globally
  globalWithMongoose.mongoose = cached;

  return cached.conn;
};
