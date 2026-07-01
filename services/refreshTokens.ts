import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { createHash, randomBytes } from "node:crypto"
import * as relations from "../db/relations.ts"
import * as schema from "../db/schema.ts"
import { AppError } from "../types/error.ts"

type DB = MySql2Database<typeof schema & typeof relations>

export function buildRefreshTokensService(db: DB) {
  async function issue(userId: number) {
    const token = randomBytes(32).toString("hex")
    const tokenHash = createHash("sha256").update(token).digest("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    await db.insert(schema.refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
    })

    return token
  }

  async function rotate(token: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex")
    const row = await db.query.refreshTokens.findFirst({
      where: eq(schema.refreshTokens.tokenHash, tokenHash),
    })
    if (!row || row.revokedAt || row.expiresAt < new Date()) {
      throw new AppError("INVALID_REFRESH_TOKEN", 401, "Invalid or expired refresh token")
    }
    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(schema.refreshTokens.id, row.id))

    const newRefreshToken = await issue(row.userId)
    return { userId: row.userId, refreshToken: newRefreshToken }
  }

  return { issue, rotate }
}

export type RefreshTokensService = ReturnType<typeof buildRefreshTokensService>
