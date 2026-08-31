const express = require("express");
const userRoutes = require("./userRoutes");
const projectRoutes = require("./projectRoutes");
const taskRoutes = require("./taskRoutes");
const aiRoutes = require("./aiRoutes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "TaskFlow API",
      version: "1.0.0",
      endpoints: {
        users: "/api/v1/users",
        projects: "/api/v1/projects",
        tasks: "/api/v1/tasks",
        ai: "/api/v1/ai",
        health: "/health",
      },
    },
  });
});

router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
