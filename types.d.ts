import "fastify"
import type {
  AuthorsService,
  BooksService,
  LoansService,
  MembersService,
  RefreshTokensService,
  UsersService,
} from "./services/index.ts"

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    booksService: BooksService
    authorsService: AuthorsService
    membersService: MembersService
    usersService: UsersService
    loansService: LoansService
    refreshTokensService: RefreshTokensService
    config: {
      MYSQL_CONNECTION_STRING: string
      JWT_SECRET: string
      NODE_ENV: string
      PORT: number
      CORS_ORIGIN: string
    }
  }
  interface FastifyRequest {
    currentUser: { id: number } | null
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: number }
    user: { userId: number }
  }
}
