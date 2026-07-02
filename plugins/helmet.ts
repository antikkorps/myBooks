import helmet from "@fastify/helmet"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

export default fp(async function (fastify: FastifyInstance) {
  await fastify.register(helmet)
})
