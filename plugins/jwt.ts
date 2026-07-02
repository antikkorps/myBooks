import jwt from "@fastify/jwt"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

const jwtPlugin = fp(async function (fastify: FastifyInstance) {
  await fastify.register(jwt, {
    secret: fastify.config.JWT_SECRET,
    sign: { expiresIn: "15m" },
  })
})

export default jwtPlugin
