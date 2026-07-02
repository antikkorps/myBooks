import bcrypt from "bcrypt"
import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import { buildApp } from "../app.ts"

let app: Awaited<ReturnType<typeof buildApp>>

before(async () => {
  app = await buildApp()
})
after(async () => {
  await app.close()
})

test("POST /login without body should return 400 VALIDATION_ERROR", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/login",
    payload: {},
  })
  assert.equal(response.statusCode, 400)
  assert.equal(response.json().code, "VALIDATION_ERROR")
})

test("unknown route should return 404 NOT_FOUND", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/unknown-route",
  })
  assert.equal(response.statusCode, 404)
  assert.equal(response.json().code, "NOT_FOUND")
})

test("unknown email => should return 401 INVALID_CREDENTIALS", async () => {
  app.usersService = { findByEmail: async () => null } as any
  const response = await app.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "email@unknown.com",
      password: "dontknow",
    },
  })
  assert.equal(response.statusCode, 401)
  assert.equal(response.json().code, "INVALID_CREDENTIALS")
})

test("wrong password => should return 401 INVALID_CREDENTIALS", async () => {
  const hash = await bcrypt.hash("TheRealOne", 12)
  app.usersService = { findByEmail: async () => ({ id: 1, passwordHash: hash }) } as any
  const response = await app.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "email@test.com",
      password: "wrongpassword",
    },
  })
  assert.equal(response.statusCode, 401)
  assert.equal(response.json().code, "INVALID_CREDENTIALS") // same response for unknown mail
})

test("valid credentials => should return 200 with accessToken and refreshToken", async () => {
  const hash = await bcrypt.hash("TheRealOne", 12)
  app.usersService = { findByEmail: async () => ({ id: 1, passwordHash: hash }) } as any
  app.refreshTokensService = {
    issue: async (userId: number) => `refresh-token-for-${userId}`,
  } as any
  const response = await app.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "email@known.com",
      password: "TheRealOne",
    },
  })
  assert.equal(response.statusCode, 200)
  assert.ok(response.json().accessToken)
  assert.ok(response.json().refreshToken)
})
