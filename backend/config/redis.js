// redis.js - Resilient Redis Client with Safe Fallback
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const rawClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Reconnect with exponential backoff up to 3s
      return Math.min(retries * 100, 3000);
    },
  },
});

rawClient.on("connect", () => console.log("✅ Redis connected"));
rawClient.on("ready", () => console.log("✅ Redis ready"));
rawClient.on("error", (err) => {
  // Silent failover to prevent unhandled rejections
});

rawClient.connect().catch(() => {
  console.log("ℹ️ Initial Redis connection failed, continuing with fallback.");
});

const safeRedis = {
  get isOpen() {
    return rawClient.isOpen;
  },
  get: async (key) => {
    try {
      if (!rawClient.isOpen) return null;
      return await rawClient.get(key);
    } catch (e) {
      return null;
    }
  },
  set: async (key, val, options) => {
    try {
      if (!rawClient.isOpen) return null;
      return await rawClient.set(key, val, options);
    } catch (e) {
      return null;
    }
  },
  setEx: async (key, seconds, val) => {
    try {
      if (!rawClient.isOpen) return null;
      return await rawClient.setEx(key, seconds, val);
    } catch (e) {
      return null;
    }
  },
  del: async (key) => {
    try {
      if (!rawClient.isOpen) return null;
      return await rawClient.del(key);
    } catch (e) {
      return null;
    }
  },
  raw: rawClient,
};

export default safeRedis;
