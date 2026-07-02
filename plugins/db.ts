import { drizzle, type MySql2Database } from "drizzle-orm/mysql2"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import mysql from "mysql2/promise"
import * as relations from "../db/relations.ts"
import * as schema from "../db/schema.ts"

declare module "fastify" {
  interface FastifyInstance {
    db: MySql2Database<typeof schema & typeof relations>
  }
}

export default fp(async function drizzlePlugin(fastify: FastifyInstance) {
  const pool = mysql.createPool(fastify.config.MYSQL_CONNECTION_STRING)

  const db = drizzle(pool, {
    schema: { ...schema, ...relations },
    mode: "default",
  })

  fastify.decorate("db", db)

  fastify.addHook("onClose", async () => {
    await pool.end()
    fastify.log.info("Closing Drizzle MySQL pool")
  })
})
