'use client'

import { useState, useEffect } from 'react'
import { Brain, FileText, ClipboardList, BarChart3, Loader2, AlertCircle, Copy, CheckCheck, RefreshCw } from 'lucide-react'

type Periodo = '7d' | '30d' | '6m' | '1a'

interface Prontuario {
  id: string
  numero: string
  paciente?: { nome: string }
  tipoProcedimento?: string
}

const PERIODO_LABELS: Record<Periodo, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '6m': 'Últimos 6 meses',
  '1a': 'Este ano',
}

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <>
      <Loader2 size={size} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

function IaUnavailableBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.25rem 0.625rem', borderRadius: 'var(--radius)',
      background: 'rgba(184,134,11,0.1)', color: 'var(--brand-warning)',
      fontSize: '0.75rem', fontWeight: 600,
    }}>
      <AlertCircle size={12} />
      IA Indisponivel
    </span>
  )
}

// ─── Card 1: Assistente de Anamnese ───────────────────────────────────────────
function AssistenteAnamneseCard() {
  const [queixa, setQueixa] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    if (!queixa.trim()) return
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const res = await fetch('/api/ia/anamnese', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queixaPrincipal: queixa }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Erro')
      const json = await res.json()
      setResultado(json.data?.sugestao ?? 'Sugestoes geradas com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'IA indisponivel no momento.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!resultado) return
    navigator.clipboard.writeText(resultado)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ClipboardList size={20} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Assistente de Anamnese</h3>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Sugestoes de perguntas e campos clinicos
          </p>
        </div>
      </div>

      <form onSubmit={handleGerar}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Queixa Principal <span className="required">*</span></label>
          <textarea
            className="form-input"
            rows={3}
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            placeholder="Ex: Paciente deseja harmonizacao da regiao perioral com preenchimento labial..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !queixa.trim()}
          style={{ width: '100%' }}
        >
          {loading ? <><Spinner size={16} /> Gerando sugestoes...</> : <><Brain size={16} /> Gerar Sugestoes</>}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.875rem', borderRadius: 'var(--radius)',
            background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)',
            color: 'var(--brand-danger)', fontSize: '0.875rem', marginBottom: '0.75rem',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
          <IaUnavailableBadge />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Preencha manualmente os campos de anamnese no prontuario.
          </p>
        </div>
      )}

      {resultado && !loading && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Sugestoes geradas
            </span>
            <button onClick={handleCopy} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {copied ? <><CheckCheck size={14} color="var(--brand-success)" /> Copiado</> : <><Copy size={14} /> Copiar</>}
            </button>
          </div>
          <div style={{
            padding: '1rem', borderRadius: 'var(--radius)',
            background: 'rgba(46,93,142,0.04)', border: '1px solid rgba(46,93,142,0.15)',
            fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap',
            maxHeight: 280, overflowY: 'auto', color: 'var(--text-primary)',
          }}>
            {resultado}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Card 2: Gerador de TCLE ──────────────────────────────────────────────────
function GeradorTcleCard() {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([])
  const [prontuarioId, setProntuarioId] = useState('')
  const [procedimentosTexto, setProcedimentosTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadProntuarios() {
      try {
        const res = await fetch('/api/prontuarios?pageSize=50')
        if (!res.ok) return
        const json = await res.json()
        setProntuarios(json.data ?? [])
      } catch {
        // silencia
      }
    }
    loadProntuarios()
  }, [])

  async function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    if (!prontuarioId) return
    const procedimentos = procedimentosTexto
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)
    if (!procedimentos.length) return
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const res = await fetch('/api/ia/tcle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prontuarioId, procedimentos }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Erro')
      const json = await res.json()
      setResultado(json.data?.conteudo ?? 'TCLE gerado com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'IA indisponivel no momento.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!resultado) return
    navigator.clipboard.writeText(resultado)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, var(--brand-accent), #D4A574)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FileText size={20} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Gerador de TCLE</h3>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Termo de Consentimento personalizado com IA
          </p>
        </div>
      </div>

      <form onSubmit={handleGerar}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Prontuario <span className="required">*</span></label>
          <select
            className="form-input"
            value={prontuarioId}
            onChange={(e) => setProntuarioId(e.target.value)}
            required
          >
            <option value="">Selecione o prontuario...</option>
            {prontuarios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.numero} — {p.paciente?.nome ?? 'Paciente'} ({p.tipoProcedimento ?? 'Procedimento'})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Procedimentos <span className="required">*</span>
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.375rem', fontSize: '0.75rem' }}>
              (um por linha)
            </span>
          </label>
          <textarea
            className="form-input"
            rows={3}
            value={procedimentosTexto}
            onChange={(e) => setProcedimentosTexto(e.target.value)}
            placeholder={'Toxina Botulínica — Frontal\nPreenchimento Labial com AH\nBioestimulador — Radiesse'}
            style={{ resize: 'vertical' }}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-accent"
          disabled={loading || !prontuarioId || !procedimentosTexto.trim()}
          style={{ width: '100%' }}
        >
          {loading ? <><Spinner size={16} /> Gerando TCLE...</> : <><FileText size={16} /> Gerar TCLE</>}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.875rem', borderRadius: 'var(--radius)',
            background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)',
            color: 'var(--brand-danger)', fontSize: '0.875rem', marginBottom: '0.75rem',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
          <IaUnavailableBadge />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Use o template padrao de TCLE disponivel na pagina do prontuario.
          </p>
        </div>
      )}

      {resultado && !loading && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              TCLE gerado
            </span>
            <button onClick={handleCopy} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {copied ? <><CheckCheck size={14} color="var(--brand-success)" /> Copiado</> : <><Copy size={14} /> Copiar</>}
            </button>
          </div>
          <div style={{
            padding: '1rem', borderRadius: 'var(--radius)',
            background: 'rgba(201,149,106,0.04)', border: '1px solid rgba(201,149,106,0.2)',
            fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap',
            maxHeight: 280, overflowY: 'auto', color: 'var(--text-primary)',
          }}>
            {resultado}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Card 3: Análise de Relatório ─────────────────────────────────────────────
function AnaliseRelatorioCard() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  function periodoToDateRange(p: Periodo): { inicio: string; fim: string } {
    const fim = new Date()
    const inicio = new Date()
    if (p === '7d') inicio.setDate(fim.getDate() - 7)
    else if (p === '30d') inicio.setDate(fim.getDate() - 30)
    else if (p === '6m') inicio.setMonth(fim.getMonth() - 6)
    else inicio.setFullYear(fim.getFullYear() - 1)
    return { inicio: inicio.toISOString(), fim: fim.toISOString() }
  }

  async function handleAnalisar() {
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const { inicio, fim } = periodoToDateRange(periodo)
      const res = await fetch('/api/ia/relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'resumo_clinico', periodo: { inicio, fim } }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Erro')
      const json = await res.json()
      setResultado(json.data?.analise ?? 'Analise gerada com sucesso.')
      setExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'IA indisponivel no momento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, var(--brand-success), #3A9D5A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <BarChart3 size={20} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Analise de Relatorio</h3>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Insights e tendencias dos dados clinicos
          </p>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label className="form-label">Periodo de Analise</label>
        <select
          className="form-input"
          value={periodo}
          onChange={(e) => { setPeriodo(e.target.value as Periodo); setResultado(null); setError(null) }}
        >
          {(Object.keys(PERIODO_LABELS) as Periodo[]).map((p) => (
            <option key={p} value={p}>{PERIODO_LABELS[p]}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        disabled={loading}
        onClick={handleAnalisar}
        style={{ width: '100%', background: 'linear-gradient(135deg, var(--brand-success), #3A9D5A)', border: 'none' }}
      >
        {loading ? <><Spinner size={16} /> Analisando dados...</> : <><BarChart3 size={16} /> Analisar Dados</>}
      </button>

      {error && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.875rem', borderRadius: 'var(--radius)',
            background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)',
            color: 'var(--brand-danger)', fontSize: '0.875rem', marginBottom: '0.75rem',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
          <IaUnavailableBadge />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Acesse a pagina de Relatorios para visualizar os dados e exportar CSV.
          </p>
        </div>
      )}

      {resultado && !loading && (
        <div style={{ marginTop: '1.25rem' }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '0.75rem 1rem',
              background: 'rgba(45,125,70,0.06)', border: '1px solid rgba(45,125,70,0.2)',
              borderRadius: 'var(--radius)', cursor: 'pointer', marginBottom: expanded ? '0.75rem' : 0,
              fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-success)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={14} /> Analise Disponivel
            </span>
            <RefreshCw
              size={14}
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
          {expanded && (
            <div style={{
              padding: '1rem', borderRadius: 'var(--radius)',
              background: 'rgba(45,125,70,0.04)', border: '1px solid rgba(45,125,70,0.15)',
              fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap',
              maxHeight: 300, overflowY: 'auto', color: 'var(--text-primary)',
              animation: 'fade-in 0.25s ease',
            }}>
              {resultado}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function IaPage() {
  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={22} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>IA Assistente</h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '3.25rem' }}>
          Ferramentas de inteligencia artificial para apoio clinico — anamnese, TCLE e analise de dados
        </p>
      </div>

      {/* Info banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '1rem 1.25rem', borderRadius: 'var(--radius)',
        background: 'rgba(46,93,142,0.06)', border: '1px solid rgba(46,93,142,0.15)',
        marginBottom: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)',
      }}>
        <Brain size={16} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          As sugestoes geradas pela IA sao de carater auxiliar e nao substituem o julgamento clinico do profissional.
          Sempre revise e adapte o conteudo antes de utilizar nos prontuarios dos pacientes.
        </p>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <AssistenteAnamneseCard />
        <GeradorTcleCard />
        <AnaliseRelatorioCard />
      </div>
    </div>
  )
}
