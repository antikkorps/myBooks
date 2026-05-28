import { and, eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import * as relations from "../db/relations.ts"
import * as schema from "../db/schema.ts"

type DB = MySql2Database<typeof schema & typeof relations>

export function buildBooksService(db: DB) {
  async function getAll(ownerId: number) {
    return db.query.books.findMany({
      columns: {
        id: true,
        title: true,
        publishedYear: true,
      },
      with: {
        author: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      where: eq(schema.books.ownerId, ownerId),
    })
  }
  async function getById(id: number, ownerId: number) {
    return db.query.books.findFirst({
      columns: {
        id: true,
        title: true,
        publishedYear: true,
      },
      with: {
        author: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      where: and(eq(schema.books.id, id), eq(schema.books.ownerId, ownerId)),
    })
  }
  async function create(
    title: string,
    publishedYear: number | null,
    authorId: number,
    ownerId: number,
  ) {
    const [result] = await db
      .insert(schema.books)
      .values({ title, publishedYear, authorId, ownerId })
    return getById(result.insertId, ownerId)
  }

  return { getAll, getById, create }
}

export type BooksService = ReturnType<typeof buildBooksService>
