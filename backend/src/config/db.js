const mongoose = require("mongoose");
const config = require("./env");

mongoose.set("strictQuery", true);

let listenersAttached = false;

/**
 * Connects to MongoDB using the URI from environment config — never a
 * hard-coded connection string.
 *
 * Serverless-safe: reuses an existing connection if one is already open
 * (readyState === 1), which matters on platforms like Vercel where a
 * "warm" function invocation reuses the same process/module cache — this
 * function may be called on every request rather than once at boot.
 *
 * Does NOT call process.exit on failure (that would be fine for a
 * traditional long-running server, but fatal for a serverless function
 * handling one request at a time). Callers decide what "connection
 * failed" means for their environment — see server.js for the
 * traditional-hosting variant, and api/index.js for the serverless one.
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) return; // already connected

  await mongoose.connect(config.mongoUri, {
    // Fail fast instead of hanging for Mongoose's 30s default when the
    // configured database is unreachable — surfaces misconfiguration
    // immediately instead of leaving a request hanging.
    serverSelectionTimeoutMS: 8000,
  });

  const { host, port, name } = mongoose.connection;
  // eslint-disable-next-line no-console
  console.log(`[db] Connected to MongoDB at ${host}:${port}/${name}`);

  if (!listenersAttached) {
    mongoose.connection.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("[db] MongoDB connection error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      // eslint-disable-next-line no-console
      console.warn("[db] MongoDB disconnected.");
    });
    listenersAttached = true;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
