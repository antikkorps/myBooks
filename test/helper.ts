import bcrypt from "bcrypt"
export const fakeUser = async (password = "TheRealOne") => ({
  id: 1,
  passwordHash: await bcrypt.hash(password, 12),
})
