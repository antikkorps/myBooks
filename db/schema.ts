import { sql } from "drizzle-orm"
import { date, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core"

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const refreshTokens = mysqlTable("refresh_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
})

export const authors = mysqlTable("authors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  biography: text("biography"),
  birthYear: int("birth_year"),
})

export const books = mysqlTable("books", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  authorId: int("author_id")
    .notNull()
    .references(() => authors.id, { onDelete: "restrict", onUpdate: "cascade" }),
  ownerId: int("owner_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  publishedYear: int("published_year"),
})

export const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  joinedAt: date("joined_at", { mode: "string" })
    .notNull()
    .default(sql`(CURRENT_DATE)`),
})

export const loans = mysqlTable("loans", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "restrict", onUpdate: "cascade" }),
  borrowerMemberId: int("borrower_member_id").references(() => members.id, {
    onDelete: "restrict",
    onUpdate: "cascade",
  }),
  borrowerUserId: int("borrower_user_id").references(() => users.id, {
    onDelete: "restrict",
    onUpdate: "cascade",
  }),
  borrowedAt: date("borrowed_at", { mode: "string" }).notNull(),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  returnedAt: date("returned_at", { mode: "string" }),
})
