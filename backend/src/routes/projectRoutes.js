const express = require("express");
const projectController = require("../controllers/projectController");
const taskController = require("../controllers/taskController");
const aiController = require("../controllers/aiController");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const aiRateLimiter = require("../middleware/aiRateLimiter");
const projectSchemas = require("../validators/projectValidators");
const taskSchemas = require("../validators/taskValidators");
const aiSchemas = require("../validators/aiValidators");

const router = express.Router();

router.use(authenticate);

router.post("/", validate(projectSchemas.create), projectController.create);
router.get("/", validate(projectSchemas.listQuery, "query"), projectController.list);
router.get("/:id", validate(projectSchemas.idParam, "params"), projectController.getById);
router.patch("/:id", validate(projectSchemas.idParam, "params"), validate(projectSchemas.update), projectController.update);
router.delete("/:id", validate(projectSchemas.idParam, "params"), projectController.remove);

// Nested: /api/v1/projects/:projectId/tasks
router.post(
  "/:projectId/tasks",
  validate(taskSchemas.projectIdParam, "params"),
  validate(taskSchemas.create),
  taskController.create
);
router.get(
  "/:projectId/tasks",
  validate(taskSchemas.projectIdParam, "params"),
  validate(taskSchemas.listQuery, "query"),
  taskController.listForProject
);

// Nested: /api/v1/projects/:projectId/ai/* — the AI feature (see aiController).
// Rate-limited separately and more tightly than the general API, since
// these calls cost money and are slower than normal CRUD.
router.post(
  "/:projectId/ai/suggest-tasks",
  aiRateLimiter,
  validate(taskSchemas.projectIdParam, "params"),
  validate(aiSchemas.suggestTasks),
  aiController.suggestTasks
);
router.post(
  "/:projectId/ai/accept-tasks",
  validate(taskSchemas.projectIdParam, "params"),
  validate(aiSchemas.acceptTasks),
  aiController.acceptTasks
);

module.exports = router;
