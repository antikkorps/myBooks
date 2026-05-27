import type { FastifyInstance } from "fastify"
import { buildMembersService } from "../services/index.ts"

const memberProperties = {
  id: { type: "integer" },
  name: { type: "string" },
  email: { type: "string" },
  joinedAt: { type: "string" },
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
      joinedAt: { type: "string", format: "date" },
    },
  },
  response: {
    201: { type: "object", properties: memberProperties },
  },
}

async function membersRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)
  fastify.decorate("membersService", buildMembersService(fastify.db))

  fastify.get("/members", { schema: getMembersSchema }, async (request, reply) => {
    return fastify.membersService.getAll()
  })

  fastify.get<{ Params: { id: number } }>(
    "/members/:id",
    { schema: getMemberSchema },
    async (request, reply) => {
      const { id } = request.params
      const member = await fastify.membersService.getById(id)
      if (!member) {
        reply.code(404)
        return { message: "Member not found" }
      }
      return member
    },
  )

  fastify.post<{
    Body: { name: string; email: string; joinedAt?: string }
  }>("/members", { schema: postMemberSchema }, async (request, reply) => {
    const { name, email, joinedAt } = request.body
    reply.code(201)
    return fastify.membersService.create(name, email, joinedAt)
  })

  fastify.delete<{ Params: { id: number } }>(
    "/members/:id",
    { schema: getMemberSchema },
    async (request, reply) => {
      const { id } = request.params
      const member = await fastify.membersService.deleteById(id)
      if (!member) {
        reply.code(404)
        return { message: "Member not found" }
      }
      return member
    },
  )
}

export default membersRoutes
