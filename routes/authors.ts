import type { FastifyInstance } from "fastify"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

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
  fastify.get("/authors", { schema: getAuthorsSchema }, async (request, reply) => {
    const [rows] = await fastify.mysql.query("SELECT id, name FROM authors")
    return rows
  })

  fastify.post<{ Body: { name: string } }>(
    "/authors",
    { schema: postAuthorSchema },
    async (request, reply) => {
      const { name } = request.body
      const [result] = await fastify.mysql.query<ResultSetHeader>(
        "INSERT INTO authors (name) VALUES (?)",
        [name],
      )
      const authorId = result.insertId
      const [rows] = await fastify.mysql.query<RowDataPacket[]>(
        "SELECT id, name FROM authors WHERE id = ?",
        [authorId],
      )
      reply.code(201)
      return rows[0]
    },
  )

  fastify.get<{ Params: { id: number } }>(
    "/authors/:id",
    { schema: getAuthorSchema },
    async (request, reply) => {
      const { id } = request.params
      const [rows] = await fastify.mysql.query<RowDataPacket[]>(
        "SELECT id, name FROM authors WHERE id = ?",
        [id],
      )
      if (rows.length === 0) {
        reply.code(404)
        return { error: "Author not found" }
      }
      return rows[0]
    },
  )
}

export default authorRoutes
