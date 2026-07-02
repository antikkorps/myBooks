import autoload from "@fastify/autoload"
import env from "@fastify/env"
import Fastify from "fastify"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const configSchema = {
  type: "object",
  required: ["MYSQL_CONNECTION_STRING", "JWT_SECRET"],
  properties: {
    MYSQL_CONNECTION_STRING: { type: "string" },
    JWT_SECRET: { type: "string", minLength: 32 },
    NODE_ENV: { type: "string", default: "development" },
    PORT: { type: "integer", default: 8080 },
    CORS_ORIGIN: { type: "string", default: "http://localhost:3000" },
  },
}

export async function buildApp() {
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

  await fastify.register(env, { schema: configSchema })
  await fastify.register(autoload, { dir: join(__dirname, "plugins") })
  await fastify.register(autoload, { dir: join(__dirname, "routes") })

  await fastify.ready() // fait remonter les erreurs de boot tôt
  return fastify
}
