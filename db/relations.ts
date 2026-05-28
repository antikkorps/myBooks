import { relations } from "drizzle-orm"
import { authors, books, loans, members, users } from "./schema.ts"

export const usersRelations = relations(users, ({ many }) => ({
  books: many(books),
  borrowedLoans: many(loans),
}))

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
}))

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id],
  }),
  loans: many(loans),
  owner: one(users, {
    fields: [books.ownerId],
    references: [users.id],
  }),
}))

export const membersRelations = relations(members, ({ many }) => ({
  borrowedLoans: many(loans),
}))

export const loansRelations = relations(loans, ({ one }) => ({
  book: one(books, {
    fields: [loans.bookId],
    references: [books.id],
  }),
  borrowerMember: one(members, {
    fields: [loans.borrowerMemberId],
    references: [members.id],
  }),
  borrowerUser: one(users, {
    fields: [loans.borrowerUserId],
    references: [users.id],
  }),
}))
