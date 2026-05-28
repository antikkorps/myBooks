import "fastify"
import type {
  AuthorsService,
  BooksService,
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
  }
  interface FastifyRequest {
    currentUser: User | null
  }
}
