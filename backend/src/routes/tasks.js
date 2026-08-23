const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// All task routes require a valid auth token
router.use(requireAuth);

router.get("/", (req, res) => {
  const tasks = db.getTasksForUser(req.userId);
  res.json({ tasks });
});

router.post("/", (req, res) => {
  const { title } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Task title is required" });
  }
  const task = db.createTask({ userId: req.userId, title: title.trim() });
  res.status(201).json({ task });
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = db.findTaskById(id);

  if (!task || task.userId !== req.userId) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body || {};
  const updates = {};
  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ error: "Task title cannot be empty" });
    }
    updates.title = title.trim();
  }
  if (completed !== undefined) updates.completed = Boolean(completed);

  const updated = db.updateTask(id, updates);
  res.json({ task: updated });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = db.findTaskById(id);

  if (!task || task.userId !== req.userId) {
    return res.status(404).json({ error: "Task not found" });
  }

  db.deleteTask(id);
  res.status(204).send();
});

module.exports = router;
