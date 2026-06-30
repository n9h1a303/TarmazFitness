import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        credential: { label: "Email hoặc SĐT", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.credential || !credentials?.password) {
          return null
        }

        const credential = credentials.credential as string
        const password = credentials.password as string

        const isEmail = credential.includes("@")
        const user = isEmail
          ? await prisma.user.findUnique({ where: { email: credential } })
          : await prisma.user.findUnique({ where: { phone: credential } })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

export async function getServerSession() {
  const session = await auth()
  return session
}
