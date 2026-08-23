const request = require("supertest");
const createApp = require("../src/app");
const db = require("../src/db");

const app = createApp();

let token;

beforeEach(async () => {
  db.reset();
  const res = await request(app).post("/api/auth/register").send({
    email: "user@example.com",
    password: "password123",
  });
  token = res.body.token;
});

describe("GET /api/tasks", () => {
  test("rejects requests with no auth token (failure case)", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  test("returns an empty list for a new user (happy path)", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toEqual([]);
  });
});

describe("POST /api/tasks", () => {
  test("creates a task when authorized (happy path)", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Write README" });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe("Write README");
    expect(res.body.task.completed).toBe(false);
  });

  test("rejects a task with an empty title (failure case)", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "   " });

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/tasks/:id", () => {
  test("updates a task's completed state (happy path)", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Ship feature" });

    const res = await request(app)
      .put(`/api/tasks/${created.body.task.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.task.completed).toBe(true);
  });

  test("returns 404 for a task belonging to another user (failure case)", async () => {
    // Second user
    const other = await request(app).post("/api/auth/register").send({
      email: "other@example.com",
      password: "password123",
    });
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${other.body.token}`)
      .send({ title: "Not yours" });

    const res = await request(app)
      .put(`/api/tasks/${created.body.task.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  test("deletes an existing task (happy path)", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Temp task" });

    const res = await request(app)
      .delete(`/api/tasks/${created.body.task.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);

    const list = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);
    expect(list.body.tasks).toEqual([]);
  });

  test("returns 404 when deleting a non-existent task (failure case)", async () => {
    const res = await request(app)
      .delete("/api/tasks/999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
