# TaskFlow
Week 5 | Task 1 of my Internship at Neurofive Solutions

A minimal full-stack task manager built to demonstrate testing across the
whole stack: unit/component tests on the frontend, integration tests on the
backend API, and one end-to-end test simulating a real user flow.

- **Backend:** Node.js + Express, JWT auth, in-memory data store
- **Frontend:** React + Vite
- **Frontend tests:** Vitest + React Testing Library
- **Backend tests:** Jest + Supertest
- **E2E tests:** Playwright

## Project structure

```
taskflow/
├── backend/
│   ├── server.js            # entrypoint (binds the port)
│   ├── src/
│   │   ├── app.js           # Express app factory (used directly by tests)
│   │   ├── db.js            # in-memory data store
│   │   ├── middleware/auth.js
│   │   └── routes/{auth,tasks}.js
│   └── tests/
│       ├── auth.test.js     # 6 tests
│       └── tasks.test.js    # 8 tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js           # fetch wrapper for the backend API
│   │   └── components/{LoginForm,RegisterForm,TaskForm,TaskItem,TaskList}.jsx
│   └── tests/               # 5 files, 14 tests total
└── e2e/
    └── tests/flow.spec.js   # register -> add task -> see it -> delete it
```

## Prerequisites

- Node.js 18+
- npm

## 1. Install dependencies

Each package is independent, so install in each folder:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../e2e && npm install && npx playwright install chromium
```

## 2. Run the app locally

In one terminal:

```bash
cd backend
npm run dev
# API listening on http://localhost:4000
```

In a second terminal:

```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

Open http://localhost:5173, sign up, and start adding tasks.

## 3. Running the tests

### Backend tests (Jest + Supertest)

```bash
cd backend
npm test
```

Runs 14 tests across two files:

- `tests/auth.test.js` — register (happy path, duplicate email, weak
  password), login (happy path, wrong password, unknown email)
- `tests/tasks.test.js` — list/create/update/delete tasks, each with both a
  happy-path case and a failure case (no auth token, empty title, wrong
  owner, not found)

No database setup needed — the backend uses an in-memory store that resets
between test files.

### Frontend tests (Vitest + React Testing Library)

```bash
cd frontend
npm test
```

Runs 14 tests across five files, covering component rendering, form
validation, and user interaction:

- `LoginForm.test.jsx` — renders fields, blocks empty submit with a visible
  error, calls `onLogin` with the typed credentials
- `RegisterForm.test.jsx` — renders form, rejects short passwords, submits
  valid input
- `TaskForm.test.jsx` — renders input/button, blocks empty-title submit,
  calls `onAdd` with a trimmed title and clears the field
- `TaskItem.test.jsx` — renders the task title, calls `onToggle` on
  checkbox click, calls `onDelete` on button click
- `TaskList.test.jsx` — empty state message, renders one `<li>` per task

Run in watch mode while developing:

```bash
npm run test:watch
```

### End-to-end test (Playwright)

The E2E test needs both servers running first (steps in section 2 above),
then in a third terminal:

```bash
cd e2e
npx playwright test
```

This simulates a full user journey against the real, running app: register
a new account → land on the empty task board → add a task → see it render
in the list → mark it complete → delete it → confirm it's gone.

Run with a visible browser window instead of headless:

```bash
npx playwright test --headed
```

## Design notes

- The Express app is built by a factory function (`src/app.js`) that
  returns an app without binding a port, so the test suite can import and
  hit it directly via Supertest with zero network calls.
- The data layer (`src/db.js`) is a small in-memory store behind a plain
  function API, so tests don't need a real database and can call
  `db.reset()` between cases for isolation.
- Passwords are hashed with bcrypt before storage; the password hash is
  never included in any API response.
- Task ownership is checked server-side on every read/update/delete, so one
  user can't touch another user's tasks (covered by a dedicated test).
