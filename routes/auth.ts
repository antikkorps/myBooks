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

const refreshTokenSchema = {
  body: {
    type: "object",
    properties: {
      refreshToken: { type: "string" },
    },
    required: ["refreshToken"],
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
    const refreshToken = await fastify.refreshTokensService.issue(user.id)
    return { accessToken, refreshToken }
  })

  fastify.post(
    "/refresh-token",
    { schema: refreshTokenSchema },
    async (request, reply) => {
      const { refreshToken } = request.body as { refreshToken: string }
      const { userId, refreshToken: newRefreshToken } =
        await fastify.refreshTokensService.rotate(refreshToken)
      const accessToken = fastify.jwt.sign({ userId })

      return { accessToken, refreshToken: newRefreshToken }
    },
  )

  fastify.post("/logout", { schema: refreshTokenSchema }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }
    await fastify.refreshTokensService.revoke(refreshToken)
    return reply.code(204).send()
  })
}

export default authRoutes
