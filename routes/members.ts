import type { FastifyInstance } from "fastify"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

const memberProperties = {
  id: { type: "integer" },
  name: { type: "string" },
  email: { type: "string" },
  joined_at: { type: "string" },
}

const getMembersSchema = {
  description: "Get all members",
  tags: ["Members"],
  response: {
    200: {
      type: "array",
      items: { type: "object", properties: memberProperties },
    },
  },
}

const getMemberSchema = {
  description: "Get a single member by ID",
  tags: ["Members"],
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "integer" } },
  },
  response: {
    200: { type: "object", properties: memberProperties },
  },
}

const postMemberSchema = {
  description: "Create a new member",
  tags: ["Members"],
  body: {
    type: "object",
    required: ["name", "email"],
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      joined_at: { type: "string", format: "date" },
    },
  },
  response: {
    201: { type: "object", properties: memberProperties },
  },
}

const SELECT_MEMBER = `
  SELECT id, name, email, DATE_FORMAT(joined_at, '%Y-%m-%d') AS joined_at
  FROM members
`

async function membersRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  fastify.get("/members", { schema: getMembersSchema }, async () => {
    const [rows] = await fastify.mysql.query<RowDataPacket[]>(SELECT_MEMBER)
    return rows
  })

  fastify.get<{ Params: { id: number } }>(
    "/members/:id",
    { schema: getMemberSchema },
    async (request, reply) => {
      const { id } = request.params
      const [rows] = await fastify.mysql.query<RowDataPacket[]>(
        `${SELECT_MEMBER} WHERE id = ?`,
        [id],
      )
      if (rows.length === 0) {
        reply.code(404)
        return { error: "Member not found" }
      }
      return rows[0]
    },
  )

  fastify.post<{
    Body: { name: string; email: string; joined_at?: string }
  }>("/members", { schema: postMemberSchema }, async (request, reply) => {
    const { name, email, joined_at } = request.body
    const [result] = joined_at
      ? await fastify.mysql.query<ResultSetHeader>(
          "INSERT INTO members (name, email, joined_at) VALUES (?, ?, ?)",
          [name, email, joined_at],
        )
      : await fastify.mysql.query<ResultSetHeader>(
          "INSERT INTO members (name, email) VALUES (?, ?)",
          [name, email],
        )
    const [rows] = await fastify.mysql.query<RowDataPacket[]>(
      `${SELECT_MEMBER} WHERE id = ?`,
      [result.insertId],
    )
    reply.code(201)
    return rows[0]
  })
}

export default membersRoutes
