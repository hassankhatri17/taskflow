# TaskFlow
Week 5 | Task 2 of my Internship at Neurofive Solutions

A minimal full-stack task manager. Built in Week 5 to demonstrate testing
across the whole stack (unit/component/integration/E2E), then deployed to
production with a performance and SEO pass.

- **Backend:** Node.js + Express, JWT auth, in-memory data store
- **Frontend:** React + Vite
- **Frontend tests:** Vitest + React Testing Library
- **Backend tests:** Jest + Supertest
- **E2E tests:** Playwright

## Live app

- **Frontend:** https://helpful-kangaroo-38602d.netlify.app
- **Backend API:** https://taskflow-api-yv9d.onrender.com (health check: `/api/health`)

## Architecture overview

┌─────────────────────┐ HTTPS / JSON ┌──────────────────────┐
│ Frontend (SPA) │ ──────────────────────────▶│ Backend (API) │
│ React + Vite │ │ Node.js + Express │
│ hosted on Netlify │◀────────────────────────── │ hosted on Render │
└──────────┬───────────┘ Bearer JWT └───────────┬──────────┘
│ │
│ static build (dist/) served via Netlify's CDN │ in-memory
│ VITE_API_URL points at the Render backend │ data store
▼ ▼
Browser (mobile/desktop) users[] / tasks[]


- The frontend is a static Vite build with no server-side rendering, so it
  deploys as static files to a CDN (Netlify).
- The backend is a stateless Express API; auth is JWT-based (no sessions),
  so any number of backend instances could serve requests behind a load
  balancer without sticky sessions.
- The two are decoupled by `VITE_API_URL` (frontend) and `CORS_ORIGIN`
  (backend) — deploying either independently just means updating that one
  env var.
- The in-memory store means backend restarts (e.g. Render's free tier
  spinning down after inactivity) reset all data — noted as a known
  limitation, not a bug, for this task.

## Project structure

taskflow/
├── backend/
│ ├── server.js # entrypoint (binds the port)
│ ├── src/
│ │ ├── app.js # Express app factory (used directly by tests)
│ │ ├── db.js # in-memory data store
│ │ ├── middleware/auth.js
│ │ └── routes/{auth,tasks}.js
│ └── tests/
│ ├── auth.test.js # 6 tests
│ └── tasks.test.js # 8 tests
├── frontend/
│ ├── src/
│ │ ├── App.jsx
│ │ ├── api.js # fetch wrapper for the backend API
│ │ └── components/{LoginForm,RegisterForm,TaskForm,TaskItem,TaskList}.jsx
│ └── tests/ # 5 files, 14 tests total
└── e2e/
└── tests/flow.spec.js # register -> add task -> see it -> delete it


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

## Environment variables

Copy the example files and fill them in:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| File               | Variable      | Purpose                                             |
| ------------------ | ------------- | ---------------------------------------------------- |
| `backend/.env`      | `PORT`        | Port the API listens on (host usually sets this)     |
| `backend/.env`      | `JWT_SECRET`  | Secret for signing auth tokens — must be random in prod |
| `backend/.env`      | `CORS_ORIGIN` | Comma-separated list of allowed frontend origins      |
| `frontend/.env`     | `VITE_API_URL`| Base URL of the backend API                           |

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

## Deployment

### Backend → Render

1. Push this repo to GitHub (if not already).
2. On [render.com](https://render.com): **New → Web Service**, connect the
   `hassankhatri17/taskflow` repo.
3. Settings:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variables in the Render dashboard: `JWT_SECRET`
   (generate a long random string) and `CORS_ORIGIN` (your Netlify URL).
5. Deploy. Confirm it's up: `https://<your-service>.onrender.com/api/health`
   should return `{"status":"ok"}`.

### Frontend → Netlify

1. `cd frontend && npm run build` locally to sanity-check the build.
2. On [app.netlify.com](https://app.netlify.com): drag-and-drop the
   `frontend/dist` folder (Netlify Drop).
3. Add `VITE_API_URL` set to your Render backend URL + `/api` in the
   `frontend/.env` file before building, so it's baked into the build.
4. Go back to Render and set `CORS_ORIGIN` to your live Netlify URL, then
   redeploy the backend so it accepts requests from the deployed frontend.
5. Open the Netlify URL, register an account, add a task, confirm it
   round-trips through the live backend.

## Performance pass

Changes made ahead of the Lighthouse audit, and why:

1. **Removed the render-blocking font `@import`** from `index.css` and
   replaced it with a preloaded `<link>` in `index.html` (media-swap
   trick) — the browser no longer has to fetch and parse the font CSS
   before it can start building the page's CSSOM.
2. **Code-split the `RegisterForm` component** with `React.lazy` +
   `Suspense` — it's only fetched when a visitor actually clicks "Sign
   up," shrinking the JS the browser has to parse/execute on first load.
3. **Added long-lived cache headers** (`netlify.toml`) for hashed static
   assets (`Cache-Control: public, max-age=31536000, immutable`) — safe
   because Vite fingerprints filenames per build, so repeat visits skip
   re-downloading unchanged JS/CSS.
4. **Added gzip compression** (`compression` middleware) on the backend
   for smaller API response payloads.

### Lighthouse scores

| | Mobile | Desktop |
| --- | --- | --- |
| Performance | 99 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 91 | 91 |

## SEO essentials

- `<title>` and `<meta name="description">` set in `index.html`
- Open Graph tags (`og:title`, `og:description`, `og:type`) for social
  previews
- `favicon.svg` so there's no missing-icon 404
- No `<img>` tags exist in this app, so there's nothing needing alt text —
  if you add avatars or icons later, give every `<img>` a descriptive
  `alt`

## Mobile/desktop check after deployment

Once live, verify on the actual deployed URL (not localhost):

- Open the Netlify URL on your phone (or Chrome DevTools device toolbar) —
  check the login/register forms are usable and the task list doesn't
  overflow
- Open on desktop at a couple of widths (narrow window + full screen)
- Register, log in, add/toggle/delete a task on both to confirm the live
  backend responds correctly (not just cached local state)

## Recording the demo video

**Task 1 (testing) video:**

1. `cd backend && npm test` — show all backend tests passing
2. `cd frontend && npm test` — show all frontend tests passing
3. Start both dev servers, then `cd e2e && npx playwright test --headed` —
   show the E2E test driving a real browser through the app

**Task 2 (deployment & performance) video:**

1. Open the live Netlify URL, register/log in, add and complete a task —
   show it working end-to-end against the live Render backend
2. Resize the browser (or open on your phone) to show it working on
   mobile and desktop
3. Show the before/after Lighthouse scores side by side (screenshot or
   DevTools Lighthouse tab) and briefly name the 3 fixes above