# fastify-server

A small Fastify learning project built around a library-management API (books, authors, members). The goal is not production code but to cover the framework's core concepts one by one.

## Stack

- **Fastify v5** (TypeScript, ESM)
- **MySQL** via `@fastify/mysql` (raw SQL, shared pool)
- **tsx** to run TypeScript without a build step
- **pino-pretty** for dev logs

## Getting started

Requirements: Node 22+, a reachable MySQL database, and a `.env` file with the DB connection (loaded via `tsx --env-file`).

```bash
npm install
npm run dev    # tsx watch + .env
npm start      # no watch
```

The server listens on `http://localhost:8080`.

## Structure

```
server.ts          Fastify bootstrap + autoload + graceful shutdown
plugins/
  db.ts            MySQL pool exposed via fastify-plugin (global decorator)
  auth.ts          Fake auth (x-user header) + request.currentUser decorator
routes/
  books.ts         Books CRUD
  authors.ts       Authors CRUD
  members.ts       Members CRUD
  firstRoute.ts    Demo route
types/             Shared types
types.d.ts         Fastify module augmentations
```

`@fastify/autoload` automatically loads `plugins/` then `routes/` — no manual `register` calls needed.

## Auth

All routes (except `firstRoute`) are protected by a `preHandler` hook that requires an `x-user` header:

```bash
curl http://localhost:8080/books -H "x-user: whatyouwant"
```

Without the header → `401`. Intentionally simplistic — it's just a playground for hooks and decorators.

## Concepts covered

The learning path (in order):

1. Encapsulation & plugins
2. `fastify-plugin` (breaking encapsulation to expose a global decorator)
3. JSON schemas (validation + serialization)
4. Hooks (`preHandler`, `onError`, etc.)
5. Decorators (`fastify`, `request`, `reply`)
6. Autoload
7. Lifecycle & graceful shutdown (SIGTERM → `fastify.close()`)

Note: Fastify v5 ships `ajv-formats` by default, so `format: "email"` or `"date"` in a schema works with no extra setup (unlike v4).

## Next steps

- Global error handler (`fastify.setErrorHandler`) to map MySQL errors (FK, unique) to proper 4xx responses and hide schema details
- Type MySQL rows with a generic on `query<T[]>(...)` instead of `any` casts
- Scoped auth via a sub-tree (`register(async private => ...)`) instead of repeating the hook in every routes file
- Migrate to Drizzle to replace the raw SQL
