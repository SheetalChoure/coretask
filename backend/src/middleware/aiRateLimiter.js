const rateLimit = require("express-rate-limit");

// AI calls cost money and are slower than normal CRUD — a much tighter
// ceiling than the general API rate limiter, to bound both cost and abuse.
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many AI requests. Please wait a few minutes and try again.", statusCode: 429 },
  },
});
