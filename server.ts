import Fastify from "fastify"
import fastifyMysql from "@fastify/mysql"
import firstRoute from "./routes/firstRoute.ts"
const isDev = process.env.NODE_ENV !== "production"

const fastify = Fastify({
  logger: isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : true,
})

fastify.register(fastifyMysql, {
  promise: true,
  connectionString: process.env.MYSQL_CONNECTION_STRING,
})

fastify.after(async () => {
  const [rows] = await fastify.mysql.query("SELECT 1+1 AS result")
  fastify.log.info({ rows }, "MySQL connected")
})

fastify.register(firstRoute)

fastify.listen({ port: 8080, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
