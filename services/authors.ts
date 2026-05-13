import { MySQLPromisePool } from "@fastify/mysql"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

interface AuthorRow extends RowDataPacket {
  id: number
  name: string
}

const SELECT_AUTHORS = `
SELECT id, name
FROM authors
`

export function buildAuthorsService(mysql: MySQLPromisePool) {
  async function getAll() {
    const [authors] = await mysql.query<AuthorRow[]>(SELECT_AUTHORS)
    return authors
  }
  async function getById(id: number) {
    const [authors] = await mysql.query<AuthorRow[]>(SELECT_AUTHORS + " WHERE id = ?", [
      id,
    ])
    return authors[0]
  }
  async function create(name: string) {
    const [result] = await mysql.query<ResultSetHeader>(
      `INSERT INTO authors (name) VALUES (?)`,
      [name],
    )

    return getById(result.insertId)
  }

  return { getAll, getById, create }
}

export type AuthorsService = ReturnType<typeof buildAuthorsService>
