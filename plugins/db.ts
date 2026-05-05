import fastifyMysql from "@fastify/mysql"
import type { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

const dbConnector = fp(async function (fastify: FastifyInstance, options: unknown) {
  await fastify.register(fastifyMysql, {
    promise: true,
    connectionString: process.env.MYSQL_CONNECTION_STRING,
  })

  const [rows] = await fastify.mysql.query("SELECT 1+1 AS result")
  fastify.log.info({ rows }, "MySQL connected")
})

export default dbConnector
