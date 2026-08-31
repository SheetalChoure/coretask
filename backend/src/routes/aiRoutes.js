const express = require("express");
const aiController = require("../controllers/aiController");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const aiRateLimiter = require("../middleware/aiRateLimiter");
const aiSchemas = require("../validators/aiValidators");

const router = express.Router();

router.use(authenticate);
router.use(aiRateLimiter);

router.post("/generate-description", validate(aiSchemas.generateDescription), aiController.generateDescription);

module.exports = router;
