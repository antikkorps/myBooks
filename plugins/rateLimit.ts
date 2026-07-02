import rateLimit from "@fastify/rate-limit"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

export default fp(async function rateLimitPlugin(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  })
})
