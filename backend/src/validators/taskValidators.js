const Joi = require("joi");
const { objectId } = require("./common");
const { TASK_STATUSES, TASK_PRIORITIES } = require("../db/store");

const create = Joi.object({
  title: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().trim().max(2000).allow("").default(""),
  assigneeId: objectId.allow(null).default(null),
  priority: Joi.string().valid(...TASK_PRIORITIES).default("medium"),
  dueDate: Joi.date().iso().allow(null).default(null),
});

const update = Joi.object({
  title: Joi.string().trim().min(2).max(160),
  description: Joi.string().trim().max(2000).allow(""),
  assigneeId: objectId.allow(null),
  priority: Joi.string().valid(...TASK_PRIORITIES),
  dueDate: Joi.date().iso().allow(null),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update." });

const updateStatus = Joi.object({
  status: Joi.string().valid(...TASK_STATUSES).required(),
});

const idParam = Joi.object({
  id: objectId.required(),
});

const projectIdParam = Joi.object({
  projectId: objectId.required(),
});

const listQuery = Joi.object({
  projectId: objectId,
  status: Joi.string().valid(...TASK_STATUSES),
  priority: Joi.string().valid(...TASK_PRIORITIES),
  assigneeId: objectId,
  search: Joi.string().trim().max(160),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { create, update, updateStatus, idParam, projectIdParam, listQuery };
