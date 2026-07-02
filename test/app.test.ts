import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import { buildApp } from "../app.ts"
import { AppError } from "../types/error.ts"
import { fakeUser } from "./helper.ts"

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
  app.usersService = { findByEmail: async () => await fakeUser("TheRealOne") } as any
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
  app.usersService = { findByEmail: async () => await fakeUser("TheRealOne") } as any
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

test("POST invalid refresh route => should return 400 VALIDATION_ERROR", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/refresh-token",
    payload: {},
  })
  assert.equal(response.statusCode, 400)
  assert.equal(response.json().code, "VALIDATION_ERROR")
})

test("POST valid refresh route => should return 200 with new accessToken and refreshToken", async () => {
  app.refreshTokensService = {
    rotate: async (refreshToken: string) => ({
      userId: 1,
      refreshToken: `new-${refreshToken}`,
    }),
  } as any
  const response = await app.inject({
    method: "POST",
    url: "/refresh-token",
    payload: {
      refreshToken: "old-refresh-token",
    },
  })
  assert.equal(response.statusCode, 200)
  assert.ok(response.json().accessToken)
  assert.ok(response.json().refreshToken)
})

test("POST /refresh-token with invalid token => 401 INVALID_REFRESH_TOKEN", async () => {
  app.refreshTokensService = {
    rotate: async () => {
      throw new AppError("INVALID_REFRESH_TOKEN", 401)
    },
  } as any
  const response = await app.inject({
    method: "POST",
    url: "/refresh-token",
    payload: { refreshToken: "invalid" },
  })
  assert.equal(response.statusCode, 401)
  assert.equal(response.json().code, "INVALID_REFRESH_TOKEN")
})
