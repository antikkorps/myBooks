import type { FastifyInstance } from "fastify"
import { buildAuthorsService } from "../services/index.ts"
const getAuthorsSchema = {
  description: "Get all authors",
  tags: ["Authors"],
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
    },
  },
}

const postAuthorSchema = {
  description: "Create a new author",
  tags: ["Authors"],
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
    },
    required: ["name"],
  },
  response: {
    201: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    },
  },
}

const getAuthorSchema = {
  description: "Get a single author by ID",
  tags: ["Authors"],
  params: {
    type: "object",
    properties: {
      id: { type: "integer" },
    },
    required: ["id"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    },
  },
}

async function authorRoutes(fastify: FastifyInstance, options: unknown) {
  fastify.addHook("preHandler", fastify.authenticate)
  fastify.decorate("authorsService", buildAuthorsService(fastify.mysql))
  fastify.get("/authors", { schema: getAuthorsSchema }, async (request, reply) => {
    return fastify.authorsService.getAll()
  })

  fastify.post<{ Body: { name: string } }>(
    "/authors",
    { schema: postAuthorSchema },
    async (request, reply) => {
      const { name } = request.body
      reply.code(201)
      return fastify.authorsService.create(name)
    },
  )

  fastify.get<{ Params: { id: number } }>(
    "/authors/:id",
    { schema: getAuthorSchema },
    async (request, reply) => {
      const { id } = request.params
      const author = await fastify.authorsService.getById(id)
      if (!author) {
        reply.code(404)
        return { error: "Author not found" }
      }
      return author
    },
  )
}

export default authorRoutes
