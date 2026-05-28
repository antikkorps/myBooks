export type CreateLoanInput = {
  bookId: number
  borrowerMemberId?: number
  borrowerUserId?: number
  borrowedAt: string
  dueDate: string
}
