'use client'

import { useState, useEffect } from 'react'
import { User, Building2, PenLine, Shield, Save, Loader2, ExternalLink, AlertCircle, X, FileText } from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'perfil' | 'clinica' | 'assinatura' | 'seguranca'

interface PerfilData {
  nome?: string
  email?: string
  registroProfissional?: string
  telefone?: string
  conselho?: string
  numeroConselho?: string
}

interface ClinicaData {
  nome?: string
  endereco?: string
  cnpj?: string
  telefone?: string
  email?: string
  site?: string
}

interface LgpdFormData {
  tipo: string
  descricao: string
  nomeRequerente: string
  emailRequerente: string
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <>
      <Loader2 size={size} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

function SkeletonRect({ width = '100%', height = 36 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width, height, borderRadius: 'var(--radius)',
      background: 'linear-gradient(90deg, var(--border) 25%, rgba(229,231,235,0.5) 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    }} />
  )
}

// ─── Aba Perfil ───────────────────────────────────────────────────────────────
function TabPerfil() {
  const [data, setData] = useState<PerfilData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchPerfil() {
      setLoading(true)
      try {
        const res = await fetch('/api/configuracoes/perfil')
        if (!res.ok) throw new Error()
        const json = await res.json()
        setData(json.data ?? json)
      } catch {
        // mantém campos vazios silenciosamente
      } finally {
        setLoading(false)
      }
    }
    fetchPerfil()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/configuracoes/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Erro ao salvar')
      }
      toast.success('Perfil atualizado com sucesso.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nao foi possivel salvar o perfil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} style={{ animation: 'fade-in 0.3s ease' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Informacoes Profissionais</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <style>{`
          @keyframes skeleton-pulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        {loading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="form-group">
                <SkeletonRect width={120} height={14} />
                <div style={{ marginTop: '0.5rem' }}><SkeletonRect height={36} /></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                className="form-input"
                value={data.nome ?? ''}
                onChange={(e) => setData((d) => ({ ...d, nome: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail Profissional</label>
              <input
                type="email"
                className="form-input"
                value={data.email ?? ''}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Registro Profissional (CRO/CRM)</label>
              <input
                type="text"
                className="form-input"
                value={data.registroProfissional ?? data.numeroConselho ?? ''}
                onChange={(e) => setData((d) => ({ ...d, registroProfissional: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone Celular</label>
              <input
                type="text"
                className="form-input"
                value={data.telefone ?? ''}
                onChange={(e) => setData((d) => ({ ...d, telefone: e.target.value }))}
              />
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving || loading}>
          {saving ? <><Spinner /> Salvando...</> : <><Save size={16} /> Salvar Alteracoes</>}
        </button>
      </div>
    </form>
  )
}

// ─── Aba Clinica ──────────────────────────────────────────────────────────────
function TabClinica() {
  const [data, setData] = useState<ClinicaData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchClinica() {
      setLoading(true)
      try {
        const res = await fetch('/api/configuracoes/clinica')
        if (!res.ok) throw new Error()
        const json = await res.json()
        setData(json.data ?? json)
      } catch {
        // silencia
      } finally {
        setLoading(false)
      }
    }
    fetchClinica()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/configuracoes/clinica', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Erro ao salvar')
      }
      toast.success('Dados da clinica atualizados com sucesso.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nao foi possivel salvar os dados da clinica.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} style={{ animation: 'fade-in 0.3s ease' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Dados da Clinica</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Estes dados sairao no cabecalho do PDF dos prontuarios gerados.
      </p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="form-group">
              <SkeletonRect width={140} height={14} />
              <div style={{ marginTop: '0.5rem' }}><SkeletonRect height={36} /></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Nome da Clinica (Razao Social ou Fantasia)</label>
            <input
              type="text"
              className="form-input"
              value={data.nome ?? ''}
              onChange={(e) => setData((d) => ({ ...d, nome: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Endereco Completo</label>
            <input
              type="text"
              className="form-input"
              value={data.endereco ?? ''}
              onChange={(e) => setData((d) => ({ ...d, endereco: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">CNPJ</label>
            <input
              type="text"
              className="form-input font-mono"
              value={data.cnpj ?? ''}
              onChange={(e) => setData((d) => ({ ...d, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone / WhatsApp</label>
            <input
              type="text"
              className="form-input"
              value={data.telefone ?? ''}
              onChange={(e) => setData((d) => ({ ...d, telefone: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail de Contato</label>
            <input
              type="email"
              className="form-input"
              value={data.email ?? ''}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Site</label>
            <input
              type="url"
              className="form-input"
              value={data.site ?? ''}
              onChange={(e) => setData((d) => ({ ...d, site: e.target.value }))}
              placeholder="https://"
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving || loading}>
          {saving ? <><Spinner /> Salvando...</> : <><Save size={16} /> Salvar Alteracoes</>}
        </button>
      </div>
    </form>
  )
}

// ─── Aba Assinatura ───────────────────────────────────────────────────────────
function TabAssinatura() {
  return (
    <div style={{ animation: 'fade-in 0.3s ease' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Minha Assinatura</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Esta assinatura sera inserida em cada Prontuario firmado por voce.
      </p>

      <div style={{
        border: '1px dashed var(--border)',
        borderRadius: 'var(--radius)',
        background: '#fff',
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1.5rem 0',
      }}>
        <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.875rem' }}>
          A funcionalidade do canvas de desenho sera ativada na integracao
        </span>
      </div>
    </div>
  )
}

// ─── Aba Seguranca e LGPD ─────────────────────────────────────────────────────
function TabSeguranca() {
  const [lgpdModalOpen, setLgpdModalOpen] = useState(false)
  const [lgpdLoading, setLgpdLoading] = useState(false)
  const [lgpdForm, setLgpdForm] = useState<LgpdFormData>({
    tipo: 'acesso',
    descricao: '',
    nomeRequerente: '',
    emailRequerente: '',
  })

  async function handleLgpdSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLgpdLoading(true)
    try {
      const res = await fetch('/api/lgpd/solicitacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: lgpdForm.tipo,
          descricao: lgpdForm.descricao || `Solicitacao de ${lgpdForm.tipo} por ${lgpdForm.nomeRequerente}`,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Erro ao registrar solicitacao')
      }
      toast.success('Solicitacao LGPD registrada com sucesso. Voce sera contatado em ate 15 dias.')
      setLgpdModalOpen(false)
      setLgpdForm({ tipo: 'ACESSO', descricao: '', nomeRequerente: '', emailRequerente: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nao foi possivel registrar a solicitacao.')
    } finally {
      setLgpdLoading(false)
    }
  }

  return (
    <div style={{ animation: 'fade-in 0.3s ease' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Gestao de Acessos e LGPD</h2>

      {/* LGPD Status */}
      <div style={{
        padding: '1.5rem',
        background: 'rgba(45,125,70,0.06)',
        borderRadius: 'var(--radius)',
        border: '1px solid rgba(45,125,70,0.2)',
        marginBottom: '1.5rem',
      }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-success)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <Shield size={16} /> LGPD Compliance ativo
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
          O registro de IPs e interacoes sobre dados sensiveis dos pacientes e auditado internamente.
          Sua senha deve possuir mais de 8 caracteres.
        </p>
      </div>

      {/* Links legais */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Documentos Legais
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', color: 'var(--text-primary)',
              textDecoration: 'none', fontSize: '0.875rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <FileText size={16} color="var(--brand-primary)" />
            Politica de Privacidade
            <ExternalLink size={13} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
          </a>
          <a
            href="/termos-de-uso"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', color: 'var(--text-primary)',
              textDecoration: 'none', fontSize: '0.875rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <FileText size={16} color="var(--brand-primary)" />
            Termos de Uso
            <ExternalLink size={13} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
          </a>
        </div>
      </div>

      {/* Acoes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button className="btn btn-outline" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
          <Shield size={16} /> Mudar Minha Senha
        </button>
        <button
          className="btn btn-outline"
          style={{ justifyContent: 'flex-start', gap: '0.75rem' }}
          onClick={() => setLgpdModalOpen(true)}
        >
          <AlertCircle size={16} /> Registrar Solicitacao LGPD
        </button>
      </div>

      {/* Modal LGPD */}
      {lgpdModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            width: '100%', maxWidth: 520,
            animation: 'fade-in 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Solicitacao LGPD</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Lei Geral de Protecao de Dados Pessoais — Lei 13.709/2018
                </p>
              </div>
              <button onClick={() => setLgpdModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLgpdSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Solicitacao <span className="required">*</span></label>
                  <select
                    className="form-input"
                    value={lgpdForm.tipo}
                    onChange={(e) => setLgpdForm((f) => ({ ...f, tipo: e.target.value }))}
                    required
                  >
                    <option value="acesso">Acesso aos meus dados</option>
                    <option value="retificacao">Retificacao de dados incorretos</option>
                    <option value="exclusao">Exclusao dos meus dados</option>
                    <option value="portabilidade">Portabilidade dos dados</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nome do Requerente <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={lgpdForm.nomeRequerente}
                    onChange={(e) => setLgpdForm((f) => ({ ...f, nomeRequerente: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail para Retorno <span className="required">*</span></label>
                  <input
                    type="email"
                    className="form-input"
                    value={lgpdForm.emailRequerente}
                    onChange={(e) => setLgpdForm((f) => ({ ...f, emailRequerente: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descricao da Solicitacao</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={lgpdForm.descricao}
                    onChange={(e) => setLgpdForm((f) => ({ ...f, descricao: e.target.value }))}
                    placeholder="Descreva sua solicitacao em detalhes (opcional)"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setLgpdModalOpen(false)} className="btn btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={lgpdLoading}>
                  {lgpdLoading ? <><Spinner /> Enviando...</> : <><Shield size={16} /> Registrar Solicitacao</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Configuracoes</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Gerencie suas preferencias de uso e dados do sistema
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 3fr', gap: '2rem', alignItems: 'start' }}>

        {/* Menu Lateral Abas */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'perfil', label: 'Meu Perfil', icon: User },
            { id: 'clinica', label: 'Dados da Clinica', icon: Building2 },
            { id: 'assinatura', label: 'Assinatura Digital', icon: PenLine },
            { id: 'seguranca', label: 'Seguranca e LGPD', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                  color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Conteudo */}
        <div className="card" style={{ padding: '2rem' }}>
          {activeTab === 'perfil' && <TabPerfil />}
          {activeTab === 'clinica' && <TabClinica />}
          {activeTab === 'assinatura' && <TabAssinatura />}
          {activeTab === 'seguranca' && <TabSeguranca />}
        </div>
      </div>
    </div>
  )
}
