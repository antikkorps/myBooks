import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import { buildRefreshTokensService } from "../services/refreshTokens.ts"

export default fp(async function (fastify: FastifyInstance) {
  fastify.decorate("refreshTokensService", buildRefreshTokensService(fastify.db))
})
