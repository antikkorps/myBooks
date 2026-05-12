import type { MySQLPromisePool } from "@fastify/mysql"
import "fastify"

declare module "fastify" {
  interface FastifyInstance {
    mysql: MySQLPromisePool
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    booksService: BooksService
  }
  interface FastifyRequest {
    currentUser: string | null
  }
}
