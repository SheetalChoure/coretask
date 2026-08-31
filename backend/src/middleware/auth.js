const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { verifyToken } = require("../utils/tokens");
const store = require("../db/store");

/**
 * Requires a valid `Authorization: Bearer <token>` header.
 * On success, attaches the authenticated user to req.user (without the
 * password hash) so downstream handlers can check ownership/role.
 */
const authenticate = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw AppError.unauthorized("Missing or malformed Authorization header. Expected: Bearer <token>.");
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw AppError.unauthorized("Your session has expired. Please log in again.");
    }
    throw AppError.unauthorized("Invalid authentication token.");
  }

  const user = await store.users.findById(payload.sub);
  if (!user) {
    throw AppError.unauthorized("The user for this token no longer exists.");
  }

  req.user = store.toPublicUser(user);
  next();
});

/**
 * Restricts a route to specific roles, e.g. authorize("admin").
 * Must run after `authenticate`.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden("You don't have permission to perform this action."));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
