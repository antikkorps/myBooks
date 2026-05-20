import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import * as relations from "../db/relations.ts"
import * as schema from "../db/schema.ts"

type DB = MySql2Database<typeof schema & typeof relations>

export function buildBooksService(db: DB) {
  async function getAll() {
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
    })
  }
  async function getById(id: number) {
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
      where: eq(schema.books.id, id),
    })
  }
  async function create(title: string, publishedYear: number | null, authorId: number) {
    const [result] = await db
      .insert(schema.books)
      .values({ title, publishedYear, authorId })
    return getById(result.insertId)
  }

  return { getAll, getById, create }
}

export type BooksService = ReturnType<typeof buildBooksService>
