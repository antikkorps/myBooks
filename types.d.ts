import "fastify"
import type {
  AuthorsService,
  BooksService,
  LoansService,
  MembersService,
  User,
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
  }
  interface FastifyRequest {
    currentUser: User | null
  }
}
