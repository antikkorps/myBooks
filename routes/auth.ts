import bcrypt from "bcrypt"
import { FastifyInstance } from "fastify"
import { AppError } from "../types/error.ts"

const loginSchema = {
  body: {
    type: "object",
    properties: {
      email: { type: "string" },
      password: { type: "string" },
    },
    required: ["email", "password"],
  },
}

async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/login", { schema: loginSchema }, async (request, reply) => {
    const { email, password } = request.body as {
      email: string
      password: string
    }
    const user = await fastify.usersService.findByEmail(email)
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError("INVALID_CREDENTIALS", 401, "Invalid email or password")
    }
    const accessToken = fastify.jwt.sign({ userId: user.id })
    return { accessToken }
  })
}

export default authRoutes
