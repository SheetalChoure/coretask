const rateLimit = require("express-rate-limit");
const config = require("../config/env");

module.exports = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many requests. Please try again later.", statusCode: 429 },
  },
});
