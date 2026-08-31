const Joi = require("joi");
const { objectId } = require("./common");

const suggestTasks = Joi.object({
  goal: Joi.string().trim().max(300).allow("").default(""),
  count: Joi.number().integer().min(1).max(10).default(5),
});

const generateDescription = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  keywords: Joi.array().items(Joi.string().trim().max(30)).max(10).default([]),
});

const acceptTasks = Joi.object({
  tasks: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().min(2).max(160).required(),
        description: Joi.string().trim().max(2000).allow("").default(""),
        priority: Joi.string().valid("low", "medium", "high").default("medium"),
        assigneeId: objectId.allow(null).default(null),
      })
    )
    .min(1)
    .max(20)
    .required(),
});

module.exports = { suggestTasks, generateDescription, acceptTasks };
