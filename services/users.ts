import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import * as relations from "../db/relations.ts"
import * as schema from "../db/schema.ts"

type DB = MySql2Database<typeof schema & typeof relations>

export function buildUsersService(db: DB) {
  async function getById(id: number) {
    return db.query.users.findFirst({
      where: eq(schema.users.id, id),
    })
  }

  return { getById }
}

export type UsersService = ReturnType<typeof buildUsersService>
export type User = typeof schema.users.$inferSelect
