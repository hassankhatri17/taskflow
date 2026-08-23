// Simple in-memory "database".
// Kept intentionally dependency-free so the app and its tests run anywhere
// with zero external services (no Postgres/Mongo required for this task).
// Swap this module out for a real DB layer later without touching routes,
// since routes only ever talk to the functions exported here.

let users = [];
let tasks = [];
let userIdCounter = 1;
let taskIdCounter = 1;

function reset() {
  users = [];
  tasks = [];
  userIdCounter = 1;
  taskIdCounter = 1;
}

// ---- Users ----
function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

function findUserById(id) {
  return users.find((u) => u.id === id);
}

function createUser({ email, passwordHash, name }) {
  const user = { id: userIdCounter++, email, passwordHash, name };
  users.push(user);
  return user;
}

// ---- Tasks ----
function getTasksForUser(userId) {
  return tasks.filter((t) => t.userId === userId);
}

function findTaskById(id) {
  return tasks.find((t) => t.id === id);
}

function createTask({ userId, title, completed = false }) {
  const task = { id: taskIdCounter++, userId, title, completed };
  tasks.push(task);
  return task;
}

function updateTask(id, updates) {
  const task = findTaskById(id);
  if (!task) return null;
  Object.assign(task, updates);
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

module.exports = {
  reset,
  findUserByEmail,
  findUserById,
  createUser,
  getTasksForUser,
  findTaskById,
  createTask,
  updateTask,
  deleteTask,
};
