const Joi = require("joi");

// MongoDB ObjectIds are 24-character hex strings. This replaces the UUID
// validator used before the switch from in-memory ids to Mongo's ids.
const objectId = Joi.string().hex().length(24).messages({
  "string.hex": "must be a valid id",
  "string.length": "must be a valid id",
});

module.exports = { objectId };
