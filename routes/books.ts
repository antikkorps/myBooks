import { type FastifyInstance } from "fastify"
import { buildBooksService } from "../services/index.ts"

const getBooksSchema = {
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          published_year: { type: "integer", nullable: true },
          author: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      },
    },
  },
}

const createBookSchema = {
  body: {
    type: "object",
    required: ["title", "author_id"],
    properties: {
      title: { type: "string" },
      author_id: { type: "integer" },
      published_year: { type: "integer", nullable: true },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        id: { type: "integer" },
        title: { type: "string" },
        author: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
          },
        },
        published_year: { type: "integer", nullable: true },
      },
    },
  },
}

async function booksRoutes(fastify: FastifyInstance, options: unknown) {
  fastify.addHook("preHandler", fastify.authenticate)
  fastify.decorate("booksService", buildBooksService(fastify.mysql))
  fastify.get("/books", { schema: getBooksSchema }, async (request, reply) => {
    return fastify.booksService.getAll()
  })

  fastify.post<{
    Body: { title: string; author_id: number; published_year?: number }
  }>("/books", { schema: createBookSchema }, async (request, reply) => {
    const { title, author_id, published_year } = request.body
    reply.code(201)
    return fastify.booksService.create(title, published_year ?? null, author_id)
  })
}

export default booksRoutes
