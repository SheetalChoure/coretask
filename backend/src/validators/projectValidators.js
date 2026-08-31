const Joi = require("joi");
const { objectId } = require("./common");

const PROJECT_STATUSES = ["active", "on-hold", "completed", "archived"];

const create = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(2000).allow("").default(""),
  status: Joi.string().valid(...PROJECT_STATUSES).default("active"),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(30)).max(8).default([]),
  dueDate: Joi.date().iso().allow(null).default(null),
  memberIds: Joi.array().items(objectId).max(50).default([]),
});

const update = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().trim().max(2000).allow(""),
  status: Joi.string().valid(...PROJECT_STATUSES),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(30)).max(8),
  dueDate: Joi.date().iso().allow(null),
  memberIds: Joi.array().items(objectId).max(50),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update." });

const idParam = Joi.object({
  id: objectId.required(),
});

const listQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { create, update, idParam, listQuery, PROJECT_STATUSES };
