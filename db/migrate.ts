import { drizzle } from "drizzle-orm/mysql2"
import { migrate } from "drizzle-orm/mysql2/migrator"
import mysql from "mysql2/promise"

const connection = await mysql.createConnection(process.env.MYSQL_CONNECTION_STRING!)
const db = drizzle(connection)

await migrate(db, { migrationsFolder: "./db/migrations" })

await connection.end()
console.log("Migrations applied.")
