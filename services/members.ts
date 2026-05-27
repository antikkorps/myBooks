import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import * as relations from "../db/relations.ts"
import * as schema from "../db/schema.ts"

type DB = MySql2Database<typeof schema & typeof relations>

export function buildMembersService(db: DB) {
  async function getAll() {
    return db.query.members.findMany()
  }
  async function getById(id: number) {
    return db.query.members.findFirst({
      where: eq(schema.members.id, id),
    })
  }

  async function create(name: string, email: string, joinedAt?: string) {
    const [result] = await db.insert(schema.members).values({ name, email, joinedAt })
    return getById(result.insertId)
  }

  async function getByEmail(email: string) {
    return db.query.members.findFirst({
      where: eq(schema.members.email, email),
    })
  }

  async function deleteById(id: number) {
    return db.delete(schema.members).where(eq(schema.members.id, id))
  }

  return { getAll, getById, create, getByEmail, deleteById }
}

export type MembersService = ReturnType<typeof buildMembersService>
