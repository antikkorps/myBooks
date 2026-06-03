import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import { AppError } from "../types/error.ts"

const authPlugin = fp(async function (fastify: FastifyInstance) {
  fastify.decorateRequest("currentUser", null)

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch {
      throw new AppError("UNAUTHORIZED", 401, "Authentication required")
    }
    request.currentUser = { id: request.user.userId }
  })
})

export default authPlugin
