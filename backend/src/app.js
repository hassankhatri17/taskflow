const express = require("express");
const cors = require("cors");
const compression = require("compression");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

function createApp() {
  const app = express();

  // In production, restrict CORS to the deployed frontend origin(s) via
  // CORS_ORIGIN (comma-separated list). Falls back to "*" for local dev.
  const allowedOrigins = (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin:
        allowedOrigins.length === 1 && allowedOrigins[0] === "*"
          ? "*"
          : allowedOrigins,
    })
  );
  app.use(compression());
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/tasks", taskRoutes);

  // 404 handler
  app.use((req, res) => res.status(404).json({ error: "Not found" }));

  // Generic error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = createApp;
