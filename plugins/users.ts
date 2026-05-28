import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import { buildUsersService } from "../services/users.ts"

export default fp(async function (fastify: FastifyInstance) {
  fastify.decorate("usersService", buildUsersService(fastify.db))
})
