import { MySQLPromisePool } from "@fastify/mysql"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

const SELECT_MEMBERS = `
SELECT id, name, email, DATE_FORMAT(joined_at, '%Y-%m-%d') AS joined_at
FROM members
`

export function buildMembersService(mysql: MySQLPromisePool) {
  async function getAll() {
    const [members] = await mysql.query<RowDataPacket[]>(SELECT_MEMBERS)
    return members
  }
  async function getById(id: number) {
    const [members] = await mysql.query<RowDataPacket[]>(
      SELECT_MEMBERS + " WHERE id = ?",
      [id],
    )
    return members[0]
  }
  async function create(name: string, email: string, joined_at?: string) {
    const [result] = joined_at
      ? await mysql.query<ResultSetHeader>(
          `INSERT INTO members (name, email, joined_at) VALUES (?, ?, ?)`,
          [name, email, joined_at],
        )
      : await mysql.query<ResultSetHeader>(
          `INSERT INTO members (name, email) VALUES (?, ?)`,
          [name, email],
        )
    return getById(result.insertId)
  }

  async function getByEmail(email: string) {
    const [members] = await mysql.query<RowDataPacket[]>(
      SELECT_MEMBERS + " WHERE email = ?",
      [email],
    )
    return members[0]
  }

  async function deleteById(id: number) {
    await mysql.query(`DELETE FROM members WHERE id = ?`, [id])
  }

  return { getAll, getById, create, getByEmail, deleteById }
}

export type MembersService = ReturnType<typeof buildMembersService>
