import Fastify from "fastify"
import dbConnector from "./plugins/db.ts"
import booksRoutes from "./routes/books.ts"
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
fastify.register(dbConnector)

fastify.register(firstRoute)
fastify.register(booksRoutes)

fastify.listen({ port: 8080, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
