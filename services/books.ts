import { MySQLPromisePool } from "@fastify/mysql"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

interface BookRow extends RowDataPacket {
  id: number
  title: string
  published_year: number | null
  author: { id: number; name: string }
}

const SELECT_BOOK = `
SELECT b.id, b.title, b.published_year, JSON_OBJECT('id', a.id, 'name', a.name) AS author
FROM books b
JOIN authors a ON a.id = b.author_id
`

export function buildBooksService(mysql: MySQLPromisePool) {
  async function getAll() {
    const [books] = await mysql.query<BookRow[]>(SELECT_BOOK)
    return books
  }
  async function getById(id: number) {
    const [books] = await mysql.query<BookRow[]>(SELECT_BOOK + " WHERE b.id = ?", [id])
    return books[0]
  }
  async function create(title: string, publishedYear: number | null, authorId: number) {
    const [result] = await mysql.query<ResultSetHeader>(
      `INSERT INTO books (
        title, published_year, author_id
        ) VALUES (?, ?, ?)`,
      [title, publishedYear, authorId],
    )
    return getById(result.insertId)
  }

  return { getAll, getById, create }
}

export type BooksService = ReturnType<typeof buildBooksService>
