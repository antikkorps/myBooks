import type { FastifyError, FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import { AppError } from "../types/error.ts"

export default fp(async function (fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      return reply
        .code(error.statusCode)
        .send({ code: error.code, message: error.message })
    }

    if (error.validation) {
      return reply.code(400).send({ code: "VALIDATION_ERROR", message: error.message })
    }

    if (error.statusCode && error.statusCode < 500) {
      return reply
        .code(error.statusCode)
        .send({ code: "CLIENT_ERROR", message: error.message })
    }
    request.log.error({ err: error }, "unhandled error")
    return reply
      .code(500)
      .send({ code: "INTERNAL_ERROR", message: "Internal Server Error" })
  })

  fastify.setNotFoundHandler((request, reply) => {
    return reply
      .code(404)
      .send({ code: "NOT_FOUND", message: request.url + " not found" })
  })
})
