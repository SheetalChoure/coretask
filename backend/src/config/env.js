require("dotenv").config();

// Centralizing env access here means the rest of the app never touches
// `process.env` directly — one place to see every config value the API
// depends on, and one place to add defaults / validation later.
const required = ["JWT_SECRET", "MONGODB_URI"];

for (const key of required) {
  if (!process.env[key] && process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.warn(
      `[config] Warning: environment variable ${key} is not set. Using an insecure default — do NOT do this in production.`
    );
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 4000,

  // Never hard-code a connection string with real credentials here — this
  // fallback is a local, credential-free default for convenience only.
  // Real deployments must set MONGODB_URI in the environment (or a secret
  // manager), e.g. mongodb+srv://<user>:<pass>@<cluster>/<db>.
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow",

  jwt: {
    secret: process.env.JWT_SECRET || "dev-only-insecure-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  },

  corsOrigin: process.env.CORS_ORIGIN || "*",

  // AI feature (task generation / project descriptions). Optional — the
  // feature degrades to a clear 503 error if this isn't configured, rather
  // than the app failing to start. Get a key at https://aistudio.google.com;
  // never hard-code it here.
  ai: {
    apiKey: process.env.GEMINI_API_KEY || "", // Fixed casing to match config.ai.apiKey
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
  },
};


