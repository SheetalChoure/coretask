API

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

