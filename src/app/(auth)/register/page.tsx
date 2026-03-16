'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Hash, MapPin, Stethoscope } from 'lucide-react'

type FormData = {
  nome: string
  email: string
  conselho: 'CFM' | 'CFO' | 'CFBM' | 'CFF'
  numeroConselho: string
  uf: string
  especialidade: string
  password: string
  passwordConfirm: string
}

const CONSELHOS = [
  { value: 'CFM', label: 'CFM — Conselho Federal de Medicina' },
  { value: 'CFO', label: 'CFO — Conselho Federal de Odontologia' },
  { value: 'CFBM', label: 'CFBM — Conselho Federal de Biomedicina' },
  { value: 'CFF', label: 'CFF — Conselho Federal de Farmácia' },
]

const UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({
    nome: '',
    email: '',
    conselho: 'CFM',
    numeroConselho: '',
    uf: 'SP',
    especialidade: '',
    password: '',
    passwordConfirm: '',
  })

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.passwordConfirm) {
      setError('As senhas não correspondem.')
      return
    }
    if (form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
        conselho: form.conselho,
        numeroConselho: form.numeroConselho,
        uf: form.uf,
        especialidade: form.especialidade || undefined,
        password: form.password,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erro ao cadastrar. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/login?registered=true')
  }

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem 0.625rem 2.25rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const iconStyle = {
    position: 'absolute' as const,
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
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
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--brand-accent) 0%, #D4A574 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', margin: '0 auto 1rem',
          }}>
            🦷
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'white', margin: 0 }}>
            Prontuário HOF
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.375rem' }}>
            Cadastro de Profissional
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
            Criar conta
          </h2>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: 'var(--brand-danger)', borderRadius: 'var(--radius)',
              padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

            {/* Nome */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Nome completo <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={iconStyle} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Dr. João da Silva"
                  value={form.nome}
                  onChange={set('nome')}
                  style={{ paddingLeft: '2.25rem' }}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                E-mail profissional <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={iconStyle} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="dr.joao@clinica.com.br"
                  value={form.email}
                  onChange={set('email')}
                  style={{ paddingLeft: '2.25rem' }}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Conselho + Número + UF */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">
                  Conselho <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Stethoscope size={14} style={iconStyle} />
                  <select
                    className="form-input"
                    value={form.conselho}
                    onChange={set('conselho')}
                    style={{ paddingLeft: '2.25rem' }}
                    required
                    disabled={loading}
                  >
                    {CONSELHOS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Número <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Hash size={14} style={iconStyle} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123456"
                    value={form.numeroConselho}
                    onChange={set('numeroConselho')}
                    style={{ paddingLeft: '2.25rem' }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  UF <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} style={iconStyle} />
                  <select
                    className="form-input"
                    value={form.uf}
                    onChange={set('uf')}
                    style={{ paddingLeft: '2.25rem' }}
                    required
                    disabled={loading}
                  >
                    {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Especialidade */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Especialidade</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Harmonização Orofacial"
                value={form.especialidade}
                onChange={set('especialidade')}
                disabled={loading}
              />
            </div>

            {/* Senha */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Senha <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={iconStyle} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={set('password')}
                  style={{ paddingLeft: '2.25rem' }}
                  required
                  minLength={8}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Confirmar senha <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={iconStyle} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Repita a senha"
                  value={form.passwordConfirm}
                  onChange={set('passwordConfirm')}
                  style={{ paddingLeft: '2.25rem' }}
                  required
                  minLength={8}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </button>
          </form>

          <div style={{
            marginTop: '1.25rem', textAlign: 'center',
            fontSize: '0.8125rem', color: 'var(--text-muted)',
          }}>
            Já tem conta?{' '}
            <a href="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Faça login
            </a>
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem',
        }}>
          {['LGPD', 'CFM', 'CFO', 'CFBM'].map((b) => (
            <span key={b} style={{
              padding: '0.25rem 0.75rem', borderRadius: '9999px',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em',
            }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
