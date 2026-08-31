require("dotenv").config();

const app = require("./src/app");
const config = require("./src/config/env");
const { connectDB, disconnectDB } = require("./src/config/db");
const store = require("./src/db/store");

async function start() {
  try {
    await connectDB();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[db] Initial MongoDB connection failed:", err.message);
    // Fatal for a traditional long-running server — there's no useful
    // degraded mode for an API whose entire job is reading/writing this DB.
    // (This exit-on-failure decision lives here, not in connectDB itself,
    // because api/index.js — the Vercel serverless entry point — needs to
    // handle the same failure by returning a 503 instead of killing the
    // process.)
    process.exit(1);
  }

  await store.seedIfEmpty();

  const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`TaskFlow API listening on port ${config.port} [${config.nodeEnv}]`);
  });

  process.on("unhandledRejection", (err) => {
    // eslint-disable-next-line no-console
    console.error("Unhandled promise rejection, shutting down:", err);
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  });

  // Graceful shutdown on Ctrl+C / process managers sending SIGTERM
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      // eslint-disable-next-line no-console
      console.log(`\n${signal} received, shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    });
  }
}

start();
