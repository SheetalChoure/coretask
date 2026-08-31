const express = require("express");
const taskController = require("../controllers/taskController");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const schemas = require("../validators/taskValidators");

const router = express.Router();

router.use(authenticate);

router.get("/", validate(schemas.listQuery, "query"), taskController.listAll);
router.get("/:id", validate(schemas.idParam, "params"), taskController.getById);
router.patch("/:id", validate(schemas.idParam, "params"), validate(schemas.update), taskController.update);
router.patch(
  "/:id/status",
  validate(schemas.idParam, "params"),
  validate(schemas.updateStatus),
  taskController.updateStatus
);
router.delete("/:id", validate(schemas.idParam, "params"), taskController.remove);

module.exports = router;
