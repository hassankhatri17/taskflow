const request = require("supertest");
const createApp = require("../src/app");
const db = require("../src/db");

const app = createApp();

beforeEach(() => {
  db.reset();
});

describe("POST /api/auth/register", () => {
  test("creates a new user and returns a token (happy path)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "alice@example.com",
      password: "secret123",
      name: "Alice",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("alice@example.com");
    // Password/hash must never be leaked back to the client
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test("rejects registration with a duplicate email (failure case)", async () => {
    await request(app).post("/api/auth/register").send({
      email: "bob@example.com",
      password: "secret123",
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "bob@example.com",
      password: "anotherpassword",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test("rejects registration with a too-short password (failure case)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "carol@example.com",
      password: "123",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      email: "dave@example.com",
      password: "correct-password",
    });
  });

  test("logs in with correct credentials (happy path)", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "dave@example.com",
      password: "correct-password",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("rejects login with wrong password (failure case)", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "dave@example.com",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
  });

  test("rejects login for an email that doesn't exist (failure case)", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "whatever123",
    });

    expect(res.status).toBe(401);
  });
});
