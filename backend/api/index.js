const app = require("../src/app");
const { connectDB } = require("../src/config/db");
const store = require("../src/db/store");

// Cached across warm invocations of the same serverless function instance —
// avoids reconnecting (and re-seeding) on every single request. A cold
// start creates a new module cache and re-runs this from scratch, which is
// exactly when a fresh connection is needed anyway.
let readyPromise = null;

async function ensureReady() {
  if (!readyPromise) {
    readyPromise = connectDB().then(() => store.seedIfEmpty());
  }
  return readyPromise;
}

/**
 * Vercel Node.js functions accept a plain (req, res) => {} handler — an
 * Express app instance satisfies that signature directly, so the only
 * thing this wrapper adds is making sure the database is connected (and
 * seeded, on a cold start against an empty database) before the app's own
 * routing/middleware ever runs.
 *
 * If the database is unreachable, this returns a clean 503 instead of
 * letting the request hang or crashing the function — see the note in
 * src/config/db.js about why connectDB() itself doesn't exit the process.
 */
module.exports = async (req, res) => {
  try {
    await ensureReady();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[db] Connection failed for this invocation:", err.message);
    readyPromise = null; // let the next invocation retry instead of caching the failure
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: { message: "Database unavailable. Please try again shortly.", statusCode: 503 } }));
    return;
  }

  return app(req, res);
};
