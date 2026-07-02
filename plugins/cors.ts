import cors from "@fastify/cors"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

export default fp(async function (fastify: FastifyInstance) {
  const origins = fastify.config.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  await fastify.register(cors, { origin: origins })
})
