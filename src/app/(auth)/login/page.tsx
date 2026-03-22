'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  // Validação para prevenir open redirect — aceitar somente caminhos relativos
  const callbackUrl =
    rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//')
      ? rawCallbackUrl
      : '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (!result?.ok) {
        setError('E-mail ou senha inválidos. Verifique suas credenciais.')
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1A2332 0%, #2E5D8E 50%, #1A2332 100%)',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        animation: 'slideUp 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--brand-accent) 0%, #D4A574 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', margin: '0 auto 1rem',
            boxShadow: '0 8px 32px rgba(201, 149, 106, 0.3)',
          }}>
            🦷
          </div>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0,
          }}>
            Prontuário HOF
          </h1>
          <p style={{
            fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem',
          }}>
            Harmonização Orofacial Digital
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: '0 20px 80px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
            Entrar na sua conta
          </h2>

          {error && (
            <div
              data-testid="login-error"
              role="alert"
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: 'var(--brand-danger)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">E-mail profissional</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  type="email"
                  data-testid="email-input"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  data-testid="password-input"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'transparent',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    padding: 0,
                  }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <a href="/esqueci-senha" style={{
                fontSize: '0.8125rem', color: 'var(--brand-primary)',
                textDecoration: 'none',
              }}>
                Esqueci a senha
              </a>
            </div>

            <button
              type="submit"
              data-testid="login-submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem', textAlign: 'center',
            fontSize: '0.8125rem', color: 'var(--text-muted)',
          }}>
            Não tem conta?{' '}
            <a href="/register" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Cadastre-se
            </a>
          </div>
        </div>

        {/* Compliance badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '1rem',
          marginTop: '1.5rem',
        }}>
          {['LGPD', 'CFM', 'CFO', 'CFBM'].map((badge) => (
            <span key={badge} style={{
              padding: '0.25rem 0.75rem', borderRadius: '9999px',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em',
            }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function LoginPageFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1A2332 0%, #2E5D8E 50%, #1A2332 100%)',
      padding: '2rem',
      color: 'white',
    }}>
      Carregando...
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}
