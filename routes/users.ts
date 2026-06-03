import type { FastifyInstance } from "fastify"

const userProperties = {
  id: { type: "integer" },
  firstName: { type: "string" },
  lastName: { type: "string" },
  email: { type: "string" },
  createdAt: { type: "string" },
}

const postUserSchema = {
  description: "Create a new user",
  tags: ["Users"],
  body: {
    type: "object",
    required: ["firstName", "lastName", "email", "password"],
    properties: {
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
    },
  },
  response: {
    201: { type: "object", properties: userProperties },
  },
}

async function usersRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Body: { firstName: string; lastName: string; email: string; password: string }
  }>("/users", { schema: postUserSchema }, async (request, reply) => {
    const { firstName, lastName, email, password } = request.body
    reply.code(201)
    return fastify.usersService.create({ firstName, lastName, email, password })
  })
}

export default usersRoutes
