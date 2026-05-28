import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

const authPlugin = fp(async function (fastify: FastifyInstance) {
  fastify.decorateRequest("currentUser", null)

  fastify.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      const header = request.headers["x-user"]
      if (typeof header !== "string") {
        reply.code(401)
        throw new Error("Missing x-user header")
      }
      const id = parseInt(header, 10)
      if (Number.isNaN(id)) {
        reply.code(401)
        throw new Error("Invalid x-user header")
      }
      const user = await fastify.usersService.getById(id)
      if (!user) {
        reply.code(401)
        throw new Error("Unknown user")
      }
      request.currentUser = user
      fastify.log.info({ id: user.id, email: user.email }, "authenticated")
    },
  )
})

export default authPlugin
