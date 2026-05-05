import { type FastifyInstance } from "fastify"
import type { ResultSetHeader } from "mysql2"

const getBooksSchema = {
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          title: { type: "string" },
          author: { type: "string" },
          published_year: { type: "integer", nullable: true },
        },
      },
    },
  },
}

const createBookSchema = {
  body: {
    type: "object",
    required: ["title", "author"],
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      published_year: { type: "integer", nullable: true },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        id: { type: "number" },
        title: { type: "string" },
        author: { type: "string" },
        published_year: { type: "integer", nullable: true },
      },
    },
  },
}

async function booksRoutes(fastify: FastifyInstance, options: unknown) {
  fastify.addHook("preHandler", fastify.authenticate)

  fastify.get("/books", { schema: getBooksSchema }, async (request, reply) => {
    const [rows] = await fastify.mysql.query("SELECT * FROM books")
    return rows
  })

  fastify.post<{
    Body: { title: string; author: string; published_year?: number }
  }>("/books", { schema: createBookSchema }, async (request, reply) => {
    const { title, author, published_year } = request.body
    const [result] = await fastify.mysql.query<ResultSetHeader>(
      "INSERT INTO books (title, author, published_year) VALUES (?, ?, ?)",
      [title, author, published_year],
    )
    reply.code(201)
    return { id: result.insertId, title, author, published_year }
  })
}

export default booksRoutes
