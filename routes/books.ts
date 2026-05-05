import { type FastifyInstance } from "fastify"
import type { ResultSetHeader } from "mysql2"

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

  fastify.get("/books", { schema: getBooksSchema }, async (request, reply) => {
    const [rows] = await fastify.mysql.query(
      `SELECT 
        b.id, 
        b.title, 
        b.published_year,                                                                  
        JSON_OBJECT('id', a.id, 'name', a.name) AS author                                                 
        FROM books b                                                                                             
        JOIN authors a ON a.id = b.author_id`,
    )
    return rows
  })

  fastify.post<{
    Body: { title: string; author_id: number; published_year?: number }
  }>("/books", { schema: createBookSchema }, async (request, reply) => {
    const { title, author_id, published_year } = request.body
    const [result] = await fastify.mysql.query<ResultSetHeader>(
      "INSERT INTO books (title, author_id, published_year) VALUES (?, ?, ?)",
      [title, author_id, published_year],
    )
    const [rows] = await fastify.mysql.query(
      `SELECT
        b.id,
        b.title,
        b.published_year,
        JSON_OBJECT('id', a.id, 'name', a.name) AS author
      FROM books b
      JOIN authors a ON a.id = b.author_id
      WHERE b.id = ?`,
      [result.insertId],
    )
    reply.code(201)
    return (rows as any[])[0]
  })
}

export default booksRoutes
