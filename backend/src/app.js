require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const config = require("./config/env");
const apiRoutes = require("./routes");
const rateLimiter = require("./middleware/rateLimiter");
const { notFoundHandler, globalErrorHandler } = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",") }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));
app.use("/api", rateLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, data: { status: "ok", uptimeSeconds: process.uptime() } });
});

app.use("/api/v1", apiRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
