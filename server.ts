import autoload from "@fastify/autoload"
import Fastify from "fastify"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
const isDev = process.env.NODE_ENV !== "production"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

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
fastify.register(autoload, {
  dir: join(__dirname, "plugins"),
})

fastify.register(autoload, {
  dir: join(__dirname, "routes"),
})

fastify.listen({ port: 8080, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})

const shutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`)
  try {
    await fastify.close()
    fastify.log.info("Server closed successfully")
    process.exit(0)
  } catch (err) {
    fastify.log.error({ err }, "Error during shutdown")
    process.exit(1)
  }
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
