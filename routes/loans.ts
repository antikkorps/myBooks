import { type FastifyInstance } from "fastify"
import { buildLoansService } from "../services/index.ts"

const loanShape = {
  type: "object",
  properties: {
    id: { type: "integer" },
    bookId: { type: "integer" },
    borrowerUserId: { type: "integer", nullable: true },
    borrowerMemberId: { type: "integer", nullable: true },
    borrowedAt: { type: "string", format: "date" },
    dueDate: { type: "string", format: "date" },
    returnedAt: { type: "string", format: "date", nullable: true },
    book: {
      type: "object",
      properties: {
        id: { type: "integer" },
        title: { type: "string" },
      },
    },
    borrowerUser: {
      type: "object",
      nullable: true,
      properties: {
        id: { type: "integer" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
      },
    },
    borrowerMember: {
      type: "object",
      nullable: true,
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
      },
    },
  },
} as const

const getLoansSchema = {
  querystring: {
    type: "object",
    properties: {
      bookId: { type: "integer" },
    },
  },
  response: {
    200: {
      type: "array",
      items: loanShape,
    },
  },
}

const createLoanSchema = {
  body: {
    type: "object",
    required: ["bookId", "borrowedAt", "dueDate"],
    properties: {
      bookId: { type: "integer" },
      borrowerUserId: { type: "integer" },
      borrowerMemberId: { type: "integer" },
      borrowedAt: { type: "string", format: "date" },
      dueDate: { type: "string", format: "date" },
    },
    oneOf: [{ required: ["borrowerUserId"] }, { required: ["borrowerMemberId"] }],
  },
  response: {
    201: loanShape,
  },
}

const getBorrowedLoansSchema = {
  response: {
    200: {
      type: "array",
      items: loanShape,
    },
  },
}

const returnLoanSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "integer" } },
  },
  response: {
    200: loanShape,
  },
}

async function loansRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)
  fastify.decorate("loansService", buildLoansService(fastify.db))

  fastify.get<{ Querystring: { bookId?: number } }>(
    "/loans",
    { schema: getLoansSchema },
    async (request) => {
      return fastify.loansService.listAsOwner(
        request.currentUser!.id,
        request.query.bookId,
      )
    },
  )

  fastify.get("/loans/borrowed", { schema: getBorrowedLoansSchema }, async (request) => {
    return fastify.loansService.listAsBorrower(request.currentUser!.id)
  })

  fastify.post<{
    Body: {
      bookId: number
      borrowerUserId?: number
      borrowerMemberId?: number
      borrowedAt: string
      dueDate: string
    }
  }>("/loans", { schema: createLoanSchema }, async (request, reply) => {
    const { bookId, borrowerUserId, borrowerMemberId, borrowedAt, dueDate } = request.body

    const loan = await fastify.loansService.create(
      { bookId, borrowerUserId, borrowerMemberId, borrowedAt, dueDate },
      request.currentUser!.id,
    )
    reply.code(201)
    return loan
  })

  fastify.patch<{ Params: { id: number } }>(
    "/loans/:id/return",
    { schema: returnLoanSchema },
    async (request) => {
      return await fastify.loansService.markAsReturned(
        request.params.id,
        request.currentUser!.id,
      )
    },
  )
}

export default loansRoutes
