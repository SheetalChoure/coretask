const express = require("express");
const userController = require("../controllers/userController");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const schemas = require("../validators/userValidators");

const router = express.Router();

// --- Public ---
router.post("/register", validate(schemas.register), userController.register);
router.post("/login", validate(schemas.login), userController.login);

// --- Authenticated ---
router.use(authenticate);

router.get("/me", userController.me);
router.get("/", userController.list);
router.get("/:id", validate(schemas.idParam, "params"), userController.getById);
router.patch("/:id", validate(schemas.idParam, "params"), validate(schemas.updateUser), userController.update);
router.delete("/:id", validate(schemas.idParam, "params"), userController.remove);

module.exports = router;
