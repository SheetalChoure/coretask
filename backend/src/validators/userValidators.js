const Joi = require("joi");
const { USER_ROLES } = require("../db/store");
const { objectId } = require("./common");

const register = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .min(8)
    .max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base": "password must contain at least one lowercase letter, one uppercase letter, and one number",
    }),
  role: Joi.string().valid(...USER_ROLES).default("member"),
});

const login = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const updateUser = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  email: Joi.string().trim().email(),
  role: Joi.string().valid(...USER_ROLES),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update." });

const idParam = Joi.object({
  id: objectId.required(),
});

module.exports = { register, login, updateUser, idParam };
