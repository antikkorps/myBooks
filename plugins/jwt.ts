import jwt from "@fastify/jwt"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

const secret = process.env.JWT_SECRET
const jwtPlugin = fp(async function (fastify: FastifyInstance) {
  if (!secret) {
    throw new Error("JWT_SECRET is not set")
  }
  await fastify.register(jwt, {
    secret: secret,
    sign: { expiresIn: "15m" },
  })
})

export default jwtPlugin
