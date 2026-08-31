const config = require("../config/env");
const AppError = require("../utils/AppError");

/**
 * Catches any request that didn't match a route. Kept separate from the
 * error handler so "route doesn't exist" is unambiguous in logs/tests.
 */
function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}.`));
}

/**
 * Normalizes a few common non-AppError exceptions (JSON parse errors,
 * JWT errors that slipped through, etc.) into an AppError shape so the
 * response format never varies.
 */
function normalizeError(err) {
  if (err instanceof AppError) return err;

  // Malformed JSON body sent by the client
  if (err.type === "entity.parse.failed") {
    return AppError.badRequest("Request body must be valid JSON.");
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return AppError.unauthorized("Invalid or expired authentication token.");
  }

  // Mongoose schema validation failed (required/enum/minlength/etc.) —
  // translate into the same { field, message } shape Joi validation uses,
  // so the client-facing error format never varies by which layer caught it.
  if (err.name === "ValidationError" && err.errors) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return AppError.badRequest("Validation failed.", details);
  }

  // Malformed MongoDB ObjectId reached a query (shouldn't normally happen —
  // Joi's objectId validator catches this first — but this is a safety net).
  if (err.name === "CastError") {
    return AppError.badRequest(`Invalid value for "${err.path}".`);
  }

  // Duplicate key (e.g. the unique index on User.email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return AppError.conflict(`A record with this ${field} already exists.`);
  }

  // Unknown/unexpected error — do not leak internals to the client
  const fallback = new AppError("Something went wrong on our end. Please try again.", 500);
  fallback.isOperational = false;
  fallback.original = err;
  return fallback;
}

// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  const normalized = normalizeError(err);

  if (!normalized.isOperational) {
    // eslint-disable-next-line no-console
    console.error("[unexpected error]", err);
  }

  const body = {
    success: false,
    error: {
      message: normalized.message,
      statusCode: normalized.statusCode,
    },
  };

  if (normalized.details) body.error.details = normalized.details;

  // Only leak stack traces in non-production environments
  if (config.nodeEnv === "development" && !normalized.isOperational) {
    body.error.stack = err.stack;
  }

  res.status(normalized.statusCode).json(body);
}

module.exports = { notFoundHandler, globalErrorHandler };
