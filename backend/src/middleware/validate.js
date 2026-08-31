const AppError = require("../utils/AppError");

/**
 * Generic validation middleware factory.
 *
 * Usage:
 *   router.post("/", validate(schema, "body"), controller.create)
 *
 * `part` selects which part of the request to validate: "body" (default),
 * "params", or "query". On failure, responds 400 with every validation
 * message collected (not just the first), so clients can fix everything
 * in one round trip.
 */
function validate(schema, part = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[part], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message.replace(/"/g, ""),
      }));
      return next(AppError.badRequest("Validation failed.", details));
    }

    req[part] = value;
    next();
  };
}

module.exports = validate;
