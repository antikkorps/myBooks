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
          publishedYear: { type: "integer", nullable: true },
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
    required: ["title", "authorId"],
    properties: {
      title: { type: "string" },
      authorId: { type: "integer" },
      publishedYear: { type: "integer", nullable: true },
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
        publishedYear: { type: "integer", nullable: true },
      },
    },
  },
}

async function booksRoutes(fastify: FastifyInstance, options: unknown) {
  fastify.addHook("preHandler", fastify.authenticate)
  fastify.decorate("booksService", buildBooksService(fastify.db))
  fastify.get("/books", { schema: getBooksSchema }, async (request, reply) => {
    return fastify.booksService.getAll(request.currentUser!.id)
  })

  fastify.post<{
    Body: { title: string; authorId: number; publishedYear?: number | null }
  }>("/books", { schema: createBookSchema }, async (request, reply) => {
    const { title, publishedYear, authorId } = request.body
    reply.code(201)
    return fastify.booksService.create(
      title,
      publishedYear ?? null,
      authorId,
      request.currentUser!.id,
    )
  })
}

export default booksRoutes
