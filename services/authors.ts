import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import * as relations from "../db/relations.ts"
import * as schema from "../db/schema.ts"

type DB = MySql2Database<typeof schema & typeof relations>

export function buildAuthorsService(db: DB) {
  async function getAll() {
    return db.query.authors.findMany()
  }
  async function getById(id: number) {
    return db.query.authors.findFirst({
      where: eq(schema.authors.id, id),
    })
  }
  async function create(
    name: string,
    biography: string | null,
    birthYear: number | null,
  ) {
    const [result] = await db
      .insert(schema.authors)
      .values({ name, biography, birthYear })
    return getById(result.insertId)
  }

  return { getAll, getById, create }
}

export type AuthorsService = ReturnType<typeof buildAuthorsService>
