import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

const authPlugin = fp(async function (fastify: FastifyInstance) {
  fastify.decorateRequest("currentUser", null)

  fastify.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      const user = request.headers["x-user"]
      if (!user || typeof user !== "string") {
        reply.code(401)
        throw new Error("Missing x-user header")
      }
      request.currentUser = user
      fastify.log.info({ user: request.currentUser }, "authenticated")
    },
  )
})

export default authPlugin
