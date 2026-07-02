import { buildApp } from "./app.ts"

const app = await buildApp() // top-level await, OK en ESM

app.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`server listening on ${address}`)
})

const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`)
  try {
    await app.close()
    app.log.info("Server closed successfully")
    process.exit(0)
  } catch (err) {
    app.log.error({ err }, "Error during shutdown")
    process.exit(1)
  }
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
