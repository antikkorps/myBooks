import "fastify"
import type { AuthorsService, BooksService, MembersService } from "./services/index.ts"

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    booksService: BooksService
    authorsService: AuthorsService
    membersService: MembersService
  }
  interface FastifyRequest {
    currentUser: string | null
  }
}
