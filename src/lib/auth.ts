import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import '@/types/auth'

type AppRole = 'ADMIN' | 'PROFISSIONAL' | 'RECEPCIONISTA'

export const { handlers, auth, signIn, signOut } = NextAuth({
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
        const email = String(credentials?.email ?? '').trim().toLowerCase()
        const password = String(credentials?.password ?? '')
        const isDevFallbackEnabled =
          process.env.NODE_ENV !== 'production' && process.env.DEV_LOGIN_FALLBACK !== 'false'

        if (!email || !password) {
          console.warn('[auth] CredentialsSignin: missing credentials')
          return null
        }

        try {
          const profissional = await prisma.profissional.findUnique({
            where: { email },
            include: { clinica: true },
          })

          if (!profissional) {
            console.warn('[auth] CredentialsSignin: user not found', { email })
            if (isDevFallbackEnabled && email === 'admin@clinicapremium.com.br' && password === '123456') {
              return {
                id: 'dev-admin',
                name: 'Administrador HOF (Dev)',
                email,
                role: 'ADMIN',
                clinicaId: 'dev-clinica',
                conselho: 'CFO',
                numeroConselho: '00001',
              }
            }
            return null
          }

          if (!profissional.ativo) {
            console.warn('[auth] CredentialsSignin: user inactive', { email })
            return null
          }

          const senhaValida = await bcrypt.compare(password, profissional.senhaHash)
          if (!senhaValida) {
            console.warn('[auth] CredentialsSignin: invalid password', { email })
            return null
          }

          return {
            id: profissional.id,
            name: profissional.nome,
            email: profissional.email,
            role: profissional.role,
            clinicaId: profissional.clinicaId,
            conselho: profissional.conselho,
            numeroConselho: profissional.numeroConselho,
          }
        } catch (error) {
          if (isDevFallbackEnabled && email === 'admin@clinicapremium.com.br' && password === '123456') {
            return {
              id: 'dev-admin',
              name: 'Administrador HOF (Dev)',
              email,
              role: 'ADMIN',
              clinicaId: 'dev-clinica',
              conselho: 'CFO',
              numeroConselho: '00001',
            }
          }

          console.error('Erro no authorize(credentials):', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.clinicaId = user.clinicaId
        token.conselho = user.conselho
        token.numeroConselho = user.numeroConselho
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as AppRole
        session.user.clinicaId = token.clinicaId as string
        session.user.conselho = token.conselho as string
        session.user.numeroConselho = token.numeroConselho as string
      }
      return session
    },
  },
})
