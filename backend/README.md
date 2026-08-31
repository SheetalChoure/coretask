# TaskFlow API

A REST API for **Users, Projects, and Tasks** — the backend for the Developer
Productivity Dashboard. Built with Node.js + Express + MongoDB (Mongoose).

- Consistent JSON response envelope on every route
- Centralized error handling with meaningful HTTP status codes
- Two layers of validation: Joi at the API boundary, Mongoose schema
  validation at the database boundary
- JWT authentication + simple role/ownership authorization
- Real persistence via MongoDB, with modeled relationships (User ↔ Project
  ↔ Task) and a unique index on email
- Idempotent demo-data seeding — safe to restart without duplicating data

---

## Quick start

```bash
npm install
cp .env.example .env      # then set MONGODB_URI (see below)
npm run dev                # nodemon, restarts on file changes
# or: npm start
```

The server starts on `http://localhost:4000` (or whatever `PORT` you set).

### Getting a MongoDB connection string

You need a running MongoDB instance before starting the API. Two easy options:

**Option A — Local install**
Install MongoDB Community Edition, then use:
```
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
```

**Option B — MongoDB Atlas (free tier, no local install)**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user (Atlas → Database Access) — this is where your
   credentials live, never in code
3. Copy the connection string it gives you into `.env`:
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/taskflow?retryWrites=true&w=majority
```

Either way, the URI is read from `.env` at runtime (`src/config/env.js`) —
it is never hard-coded anywhere in the source, and `.env` is git-ignored.

On first boot with an empty database, the API automatically seeds three demo
users, two projects, and three tasks (see [Seed data](#seed-data) below) so
you can start calling authenticated endpoints immediately. This seed is
idempotent — it checks for existing users first, so restarting the server
never duplicates data or trips the unique-email index.

A ready-to-import **Postman collection** is at `postman_collection.json`, and
a full **OpenAPI 3.0 spec** is at `openapi.yaml` (paste it into
[editor.swagger.io](https://editor.swagger.io) for an interactive explorer).

---

## Response format

Every response — success or error — is JSON with the same top-level shape.

**Success:**
```json
{
  "success": true,
  "message": "Project created.",
  "data": { "project": { "...": "..." } },
  "meta": { "page": 1, "limit": 20, "total": 2, "totalPages": 1 }
}
```
`message` and `meta` are omitted when not applicable.

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed.",
    "statusCode": 400,
    "details": [
      { "field": "name", "message": "name is required" }
    ]
  }
}
```
`details` is only present for validation errors (400) and a couple of
conflict errors (409) that benefit from structured context.

---

## Authentication

Register or log in to get a JWT, then send it as:

```
Authorization: Bearer <token>
```

Every route except `POST /users/register`, `POST /users/login`, and
`GET /health` requires this header. Missing/invalid/expired tokens return
`401`. Acting outside your permissions (e.g. editing someone else's project)
returns `403`.

### Seed data

| Email               | Password       | Role   |
|----------------------|----------------|--------|
| admin@taskflow.dev    | Password123!   | admin  |
| priya@taskflow.dev    | Password123!   | member |
| raj@taskflow.dev      | Password123!   | member |

Admins can manage any user/project/task. Members can manage their own
projects and their own account; anyone authenticated can read.

---

## Endpoints

Base URL: `/api/v1`

### Users

| Method | Path             | Auth | Description |
|--------|------------------|------|--------------|
| POST   | `/users/register` | —    | Create an account, returns a JWT |
| POST   | `/users/login`    | —    | Log in, returns a JWT |
| GET    | `/users/me`       | ✅   | Get the currently authenticated user |
| GET    | `/users`          | ✅   | List all users |
| GET    | `/users/:id`      | ✅   | Get a single user |
| PATCH  | `/users/:id`      | ✅   | Update a user (self, or admin) |
| DELETE | `/users/:id`      | ✅   | Delete a user (self, or admin) |

### Projects

| Method | Path              | Auth | Description |
|--------|-------------------|------|--------------|
| POST   | `/projects`        | ✅   | Create a project (you become the owner) |
| GET    | `/projects`        | ✅   | List projects (paginated) |
| GET    | `/projects/:id`    | ✅   | Get a single project (+ task counts) |
| PATCH  | `/projects/:id`    | ✅   | Update a project (owner, or admin) |
| DELETE | `/projects/:id`    | ✅   | Delete a project (owner, or admin). `409` if it still has tasks — pass `?force=true` to delete them together. |

A project response looks like:

```json
{
  "id": "…", "name": "Payments Gateway v3", "description": "…",
  "status": "active",
  "tags": ["backend", "critical"],
  "dueDate": "2026-09-04T00:00:00.000Z",
  "ownerId": "…", "memberIds": ["…", "…"],
  "owner": { "id": "…", "name": "Priya Nair", "initials": "PN" },
  "members": [{ "id": "…", "name": "Priya Nair", "initials": "PN" }, { "...": "..." }],
  "taskCounts": { "total": 2, "todo": 2, "inProgress": 0, "done": 0 },
  "progress": 0,
  "createdAt": "…", "updatedAt": "…"
}
```

`owner` and `members` are computed on every read (looked up from `ownerId`/`memberIds`)
so the frontend can render avatars/names without a second request. `progress` is
`done / total * 100`, rounded, and `0` when the project has no tasks yet.
Passing `memberIds` on create/update that don't match a real user returns `400`.

### Tasks

| Method | Path                              | Auth | Description |
|--------|-----------------------------------|------|--------------|
| POST   | `/projects/:projectId/tasks`      | ✅   | Create a task under a project |
| GET    | `/projects/:projectId/tasks`      | ✅   | List a project's tasks (filter + paginate) |
| GET    | `/tasks/:id`                      | ✅   | Get a single task |
| PATCH  | `/tasks/:id`                      | ✅   | Update task fields (title, description, assignee, priority, due date) |
| PATCH  | `/tasks/:id/status`               | ✅   | Move a task to a new status (validated transition) |
| DELETE | `/tasks/:id`                      | ✅   | Delete a task |

A task response includes both the raw `assigneeId` and a populated `assignee`
summary (`null` if unassigned), the same shape as `owner`/`members` above:

```json
{ "assigneeId": "…", "assignee": { "id": "…", "name": "Raj Kumar", "initials": "RK" } }
```

**List query params** (`GET /projects`, `GET /projects/:projectId/tasks`):
`page`, `limit`, and for tasks additionally `status`, `priority`,
`assigneeId`, `search`.

### Task status machine

Tasks move through `todo → in-progress → done`, and can be reopened from
`done` back to `in-progress`. Skipping straight from `todo` to `done`, or any
other jump, is rejected with `400` — this keeps the status history meaningful
instead of allowing arbitrary values. Every transition is recorded in the
task's `statusHistory` array (a mini timestamped audit log), which the
dashboard can use to show how long a task actually spent in each state.

```
todo ⇄ in-progress ⇄ done
```

### AI feature (task suggestions & project descriptions)

| Method | Path                                      | Auth | Description |
|--------|-------------------------------------------|------|--------------|
| POST   | `/projects/:projectId/ai/suggest-tasks`   | ✅   | Ask Claude for a list of suggested tasks based on the project's name/description and an optional goal. **Nothing is persisted** — returns suggestions for the client to review. |
| POST   | `/projects/:projectId/ai/accept-tasks`    | ✅   | Bulk-creates whichever suggested (or hand-edited) tasks the client sends back — same effect as calling "create task" once per item. |
| POST   | `/ai/generate-description`                | ✅   | Given a project name (+ optional keywords), returns a short generated description — used while creating a new project. |

All three require `ANTHROPIC_API_KEY` to be set (see [Environment variables](#environment-variables)); without it they return a clear `503` rather than the server failing to start. They're also rate-limited more tightly than the rest of the API (20 requests / 15 min per the `aiRateLimiter` middleware), since AI calls cost money and are slower than normal CRUD.

Example `suggest-tasks` response:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      { "title": "Add rate limiting to the login endpoint", "description": "Prevent brute-force attempts.", "priority": "high" },
      { "title": "Write onboarding doc for new contributors", "description": "One-pager covering setup and conventions.", "priority": "low" }
    ]
  }
}
```

### Health

| Method | Path      | Auth | Description |
|--------|-----------|------|--------------|
| GET    | `/health` | —    | Liveness check: `{ status: "ok", uptimeSeconds }` |

---

## HTTP status codes used

| Code | Meaning | When |
|------|---------|------|
| 200  | OK | Successful GET / PATCH / DELETE |
| 201  | Created | Successful POST that creates a resource |
| 400  | Bad Request | Validation failed, or an invalid status transition |
| 401  | Unauthorized | Missing/invalid/expired token, or bad login credentials |
| 403  | Forbidden | Authenticated, but not allowed to touch this resource |
| 404  | Not Found | Resource (or route) doesn't exist |
| 409  | Conflict | Duplicate email on register/update; deleting a project that still has tasks |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Server Error | Unexpected/unhandled exception (never leaks internals in production) |

---

## Validation

Every write endpoint (`POST`/`PATCH`) validates its body (and relevant
params/query) with [Joi](https://joi.dev) before the controller runs. Invalid
requests return `400` with a `details` array listing **every** invalid field
at once (not just the first), e.g.:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed.",
    "statusCode": 400,
    "details": [
      { "field": "password", "message": "length must be at least 8 characters long" },
      { "field": "email", "message": "must be a valid email" }
    ]
  }
}
```

---

## Environment variables

See `.env.example` for the full list with defaults:

| Variable | Purpose |
|----------|---------|
| `PORT` | Port the server listens on |
| `NODE_ENV` | `development` or `production` (affects error verbosity, logging format) |
| `MONGODB_URI` | MongoDB connection string — **the only place credentials are configured**, always from the environment, never hard-coded |
| `JWT_SECRET` | Secret used to sign/verify auth tokens — **must** be changed for real deployments |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `1d`, `12h`) |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost factor |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | API rate limiting window/ceiling |
| `CORS_ORIGIN` | Allowed origin(s) for browser clients, comma-separated, or `*` |
| `ANTHROPIC_API_KEY` | Enables the AI feature (task suggestions, descriptions). Get one at [console.anthropic.com](https://console.anthropic.com). Optional — AI routes return `503` if unset, rest of the API is unaffected |
| `ANTHROPIC_MODEL` | Which Claude model to call (defaults to a fast/cheap one — see `.env.example`) |

`src/config/env.js` warns on boot if `JWT_SECRET` or `MONGODB_URI` are
missing, and `.env` is listed in `.gitignore` so real credentials never get
committed. `.env.example` only ever contains placeholder values.

---

## Deploying to Vercel

This Express app is deployed as a single Vercel serverless function that
handles every route — `api/index.js` wraps the Express app, and
`vercel.json` rewrites all incoming paths to it.

1. **Push this repo to GitHub**, then import it in [vercel.com](https://vercel.com) → New Project.
2. **Set environment variables** in the Vercel project's Settings → Environment Variables (not in a committed file): `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` (set this to your deployed frontend's URL once you have it), and optionally `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL`.
3. **Deploy.** Vercel auto-detects the Node runtime from `vercel.json`.
4. **MongoDB Atlas network access**: since Vercel's serverless functions run from dynamic IPs, add `0.0.0.0/0` to your Atlas cluster's Network Access list (Atlas → Network Access → Add IP Address → Allow Access from Anywhere). This is fine for a project like this; a stricter production setup would use Atlas's PrivateLink/VPC peering instead.
5. **Verify**: `curl https://your-backend.vercel.app/health` should return `{"success":true,...}`.

Two details specific to running Express as a serverless function, already
handled in the code:
- **Connection reuse**: `src/config/db.js`'s `connectDB()` checks
  `mongoose.connection.readyState` before reconnecting, so a "warm"
  function invocation reuses the existing connection instead of opening a
  new one on every request.
- **No `process.exit()` in the serverless path**: the traditional
  `server.js` entry point still exits the process if MongoDB is
  unreachable at boot (appropriate for a long-running server) — but
  `api/index.js` catches that same failure and returns a clean `503`
  instead, since crashing a serverless function on every cold start would
  make the whole API permanently unreachable if the DB had a momentary
  blip.

---

## Data model & relationships

```
User ──┬── owns ──────────► Project
       └── is a member of ─► Project   (memberIds: User[])
                                 │
                                 └── has many ──► Task
                                                     │
User ◄── is assigned ───────────────────────────────┘
```

- **User** — `name`, `email` (unique, indexed), `password` (bcrypt hash,
  excluded from query results by default via `select: false`), `role`
  (`admin` | `member`).
- **Project** — belongs to one `ownerId` (→ User) and has many `memberIds`
  (→ User[]). The owner is always implicitly a member and can never be
  removed from `memberIds` by a patch.
- **Task** — belongs to exactly one `projectId` (→ Project, required — a
  task can never exist without a parent project) and optionally one
  `assigneeId` (→ User).

Deleting a project with existing tasks is blocked (`409`) unless
`?force=true` is passed, in which case its tasks are deleted first
(`Task.deleteMany({ projectId })`) before the project itself — this keeps
the collections from accumulating orphaned tasks that point at a project
that no longer exists.

### Two layers of validation

1. **Joi**, at the API boundary (`src/validators/`) — runs before a
   controller ever executes, so obviously-bad requests never reach the
   database at all, and every invalid field is reported at once.
2. **Mongoose schema validation**, at the database boundary
   (`src/models/`) — `required`, `enum`, `minlength`/`maxlength`, the
   unique index on email, etc. This is the layer that's actually
   authoritative: it's enforced no matter what writes the data (this API,
   a script, a future second service), where Joi only protects this one
   API's HTTP layer. A Mongoose `ValidationError` is caught by the global
   error handler and reshaped into the same `{ field, message }` format
   Joi errors use, so the response shape never varies by which layer
   caught the problem.

Password complexity (uppercase/lowercase/number, min length) is validated
by Joi on the **plaintext** password before it's hashed — the schema only
ever sees the bcrypt hash, so schema-level rules there just enforce
`required` rather than complexity.

---

## Error handling

All errors — thrown intentionally (`AppError`), Mongoose validation/cast/
duplicate-key errors, or unexpected exceptions — flow through a single
Express error-handling middleware (`src/middleware/errorHandler.js`). This
guarantees:

- One consistent error JSON shape everywhere, always — a failed Joi check,
  a failed Mongoose schema check, and a duplicate email all come back
  looking the same to the client.
- Stack traces are only included when `NODE_ENV=development` **and** the
  error was unexpected (never for normal 4xx errors, never in production).
- Async controller code never needs its own `try/catch` — every controller
  is wrapped in `catchAsync`, which forwards rejected promises to the error
  handler automatically.

---

## Project structure

```
api/index.js                  Vercel serverless entry point (wraps the Express app)
server.js                    traditional entry point — connects to MongoDB, seeds if empty, starts the HTTP server
vercel.json                   routes all paths to api/index.js on Vercel
src/
  app.js                     Express app: security middleware, routes, error handler
  config/
    env.js                   single source of truth for all environment variables
    db.js                    MongoDB connection (connect/disconnect), serverless-safe, no hard-coded credentials
  models/                     Mongoose schemas — User, Project, Task (validation + relationships live here)
  db/store.js                 data-access layer: every controller call goes through here, never through a model directly
  services/aiService.js        Anthropic API integration — task suggestions, project descriptions
  middleware/
    auth.js                  JWT authentication + role authorization
    validate.js               generic Joi-schema validation middleware
    errorHandler.js           centralized error handling (Joi + Mongoose + JWT errors, all normalized)
    rateLimiter.js             general API rate limit
    aiRateLimiter.js            stricter rate limit specifically for AI endpoints
  validators/                 Joi schemas per resource (user/project/task/ai) + shared ObjectId validator
  controllers/                request handlers per resource (including aiController.js)
  routes/                      route definitions per resource, mounted under /api/v1
```

`src/db/store.js` is the only file that touches Mongoose models directly.
Every exported function (`users.create`, `projects.findById`,
`tasks.setStatus`, etc.) is called by name from the controllers, and always
returns plain, already-serialized objects — controllers never see a raw
Mongoose document or an ObjectId. That boundary is what made the earlier
in-memory version's migration to real MongoDB a one-file rewrite instead of
a change to every controller.
