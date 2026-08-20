import mongoose from "mongoose";
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined in .env");
}

export default async function db() {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ Already connected to MongoDB");
    return;
  }

  
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("Database connection failed");
  }
}
