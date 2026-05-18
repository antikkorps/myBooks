import type { MySQLPromisePool } from "@fastify/mysql"
import "fastify"
import type { AuthorsService, BooksService, MembersService } from "./services/index.ts"

declare module "fastify" {
  interface FastifyInstance {
    mysql: MySQLPromisePool
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    booksService: BooksService
    authorsService: AuthorsService
    membersService: MembersService
  }
  interface FastifyRequest {
    currentUser: string | null
  }
}
