import { relations } from "drizzle-orm"
import { authors, books, loans, members } from "./schema.ts"

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
}))

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id],
  }),
  loans: many(loans),
}))

export const membersRelations = relations(members, ({ many }) => ({
  loans: many(loans),
}))

export const loansRelations = relations(loans, ({ one }) => ({
  book: one(books, {
    fields: [loans.bookId],
    references: [books.id],
  }),
  member: one(members, {
    fields: [loans.memberId],
    references: [members.id],
  }),
}))
