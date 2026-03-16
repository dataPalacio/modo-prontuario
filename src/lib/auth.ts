import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import '@/types/auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 horas
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const profissional = await prisma.profissional.findUnique({
          where: { email: credentials.email as string },
          include: { clinica: true },
        })

        if (!profissional || !profissional.ativo) return null

        const senhaValida = await bcrypt.compare(
          credentials.password as string,
          profissional.senhaHash
        )

        if (!senhaValida) return null

        return {
          id: profissional.id,
          name: profissional.nome,
          email: profissional.email,
          role: profissional.role,
          clinicaId: profissional.clinicaId,
          conselho: profissional.conselho,
          numeroConselho: profissional.numeroConselho,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = user.role
        token.clinicaId = user.clinicaId
        token.conselho = user.conselho
        token.numeroConselho = user.numeroConselho
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.clinicaId = token.clinicaId
        session.user.conselho = token.conselho
        session.user.numeroConselho = token.numeroConselho
      }
      return session
    },
  },
})
