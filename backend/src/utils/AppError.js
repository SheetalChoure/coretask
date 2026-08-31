/**
 * Operational error — anything we throw on purpose (validation failure,
 * missing resource, auth failure, etc.) should be an AppError so the
 * central error handler can tell it apart from an unexpected bug and
 * respond with the right status code + a safe message.
 */
class AppError extends Error {
  constructor(message, statusCode, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new AppError(message, 400, details);
  }
  static unauthorized(message = "Authentication required.") {
    return new AppError(message, 401);
  }
  static forbidden(message = "You don't have permission to do this.") {
    return new AppError(message, 403);
  }
  static notFound(message = "Resource not found.") {
    return new AppError(message, 404);
  }
  static conflict(message, details) {
    return new AppError(message, 409, details);
  }
}

module.exports = AppError;
