import { and, eq, inArray, isNull } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import * as relations from "../db/relations.ts"
import * as schema from "../db/schema.ts"
import type { CreateLoanInput } from "../types/loans.ts"

type DB = MySql2Database<typeof schema & typeof relations>

export function buildLoansService(db: DB) {
  async function create(input: CreateLoanInput, ownerId: number) {
    const { bookId, borrowerUserId, borrowerMemberId, borrowedAt, dueDate } = input

    if (!!borrowerUserId === !!borrowerMemberId) {
      throw new Error("INVALID_BORROWER")
    }

    const book = await db.query.books.findFirst({
      where: and(eq(schema.books.id, bookId), eq(schema.books.ownerId, ownerId)),
    })
    if (!book) throw new Error("BOOK_NOT_OWNED")

    const existing = await db.query.loans.findFirst({
      where: and(eq(schema.loans.bookId, bookId), isNull(schema.loans.returnedAt)),
    })
    if (existing) throw new Error("BOOK_ALREADY_LENT")

    if (borrowerUserId) {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, borrowerUserId),
      })
      if (!user) throw new Error("UNKNOWN_BORROWER")
    } else if (borrowerMemberId) {
      const member = await db.query.members.findFirst({
        where: eq(schema.members.id, borrowerMemberId),
      })
      if (!member) throw new Error("UNKNOWN_BORROWER")
    }

    const [result] = await db.insert(schema.loans).values({
      bookId,
      borrowerUserId: borrowerUserId ?? null,
      borrowerMemberId: borrowerMemberId ?? null,
      borrowedAt,
      dueDate,
    })
    return getById(result.insertId)
  }

  async function listAsBorrower(borrowerUserId: number) {
    return db.query.loans.findMany({
      where: eq(schema.loans.borrowerUserId, borrowerUserId),
      with: {
        book: {
          with: {
            owner: {
              columns: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    })
  }

  async function listAsOwner(ownerId: number, bookId?: number) {
    const ownerBooksSubquery = db
      .select({ id: schema.books.id })
      .from(schema.books)
      .where(eq(schema.books.ownerId, ownerId))

    return db.query.loans.findMany({
      where: bookId
        ? and(
            eq(schema.loans.bookId, bookId),
            inArray(schema.loans.bookId, ownerBooksSubquery),
          )
        : inArray(schema.loans.bookId, ownerBooksSubquery),
      with: {
        book: { columns: { id: true, title: true } },
        borrowerUser: {
          columns: { id: true, firstName: true, lastName: true, email: true },
        },
        borrowerMember: { columns: { id: true, name: true } },
      },
    })
  }

  async function markAsReturned(loanId: number, ownerId: number) {
    const loan = await db.query.loans.findFirst({
      where: eq(schema.loans.id, loanId),
      with: {
        book: { columns: { ownerId: true } },
      },
    })
    if (!loan || loan.book.ownerId !== ownerId) {
      throw new Error("BOOK_NOT_OWNED")
    }

    const today = new Date().toISOString().slice(0, 10)
    await db
      .update(schema.loans)
      .set({ returnedAt: today })
      .where(eq(schema.loans.id, loanId))
    return getById(loanId)
  }

  async function getById(id: number) {
    return db.query.loans.findFirst({
      where: eq(schema.loans.id, id),
      with: {
        book: { columns: { id: true, title: true } },
        borrowerUser: {
          columns: { id: true, firstName: true, lastName: true, email: true },
        },
        borrowerMember: { columns: { id: true, name: true } },
      },
    })
  }

  return { create, listAsBorrower, listAsOwner, markAsReturned }
}

export type LoansService = ReturnType<typeof buildLoansService>
