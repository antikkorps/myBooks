import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

async function routes(fastify: FastifyInstance, options: unknown) {
  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({ hello: "world" })
  })
}

export default routes
