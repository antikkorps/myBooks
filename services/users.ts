import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import * as relations from "../db/relations.ts"
import * as schema from "../db/schema.ts"
import { AppError } from "../types/error.ts"

type DB = MySql2Database<typeof schema & typeof relations>

export function buildUsersService(db: DB) {
  async function create(input: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) {
    const passwordHash = await bcrypt.hash(input.password, 12)
    try {
      const [{ id }] = await db
        .insert(schema.users)
        .values({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          passwordHash,
        })
        .$returningId()
      return getById(id)
    } catch (err: any) {
      if (err.cause?.code === "ER_DUP_ENTRY")
        throw new AppError("EMAIL_TAKEN", 409, "Email already registered")
      throw err
    }
  }
  async function getById(id: number) {
    return db.query.users.findFirst({
      where: eq(schema.users.id, id),
    })
  }

  async function findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(schema.users.email, email),
    })
  }

  return { getById, create, findByEmail }
}

export type UsersService = ReturnType<typeof buildUsersService>
export type User = typeof schema.users.$inferSelect
