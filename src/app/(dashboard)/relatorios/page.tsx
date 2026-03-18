'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  Download, Filter, TrendingUp, Users, Syringe, FileText,
  Brain, X, Loader2, AlertCircle, ChevronDown, BarChart3,
} from 'lucide-react'

const COLORS = ['var(--brand-primary)', 'var(--brand-accent)', '#D4A574', '#4A90B8']

type Periodo = '7d' | '30d' | '6m' | '1a'

interface KpiStats {
  novosPacientes?: number
  procedimentosRealizados?: number
  prontuariosAssinados?: number
  tendenciaPacientes?: string
  tendenciaProcedimentos?: string
  tendenciaProntuarios?: string
}

interface BarItem {
  name: string
  pacientes: number
  procedimentos: number
}

interface PieItem {
  name: string
  value: number
}

interface RelatorioData {
  evolucao?: BarItem[]
  categorias?: PieItem[]
}

const PERIODO_LABELS: Record<Periodo, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '6m': 'Últimos 6 meses',
  '1a': 'Este ano',
}

function Spinner({ size = 24 }: { size?: number }) {
  return (
    <>
      <Loader2 size={size} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

function SkeletonRect({ width = '100%', height = 20 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width, height, borderRadius: 'var(--radius)',
      background: 'linear-gradient(90deg, var(--border) 25%, rgba(229,231,235,0.5) 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    }} />
  )
}

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<Periodo>('6m')
  const [periodoOpen, setPeriodoOpen] = useState(false)

  const [kpis, setKpis] = useState<KpiStats | null>(null)
  const [kpisLoading, setKpisLoading] = useState(true)

  const [barData, setBarData] = useState<BarItem[]>([])
  const [pieData, setPieData] = useState<PieItem[]>([])
  const [chartsLoading, setChartsLoading] = useState(true)

  // IA Assistente
  const [iaModalOpen, setIaModalOpen] = useState(false)
  const [iaLoading, setIaLoading] = useState(false)
  const [iaAnalise, setIaAnalise] = useState<string | null>(null)
  const [iaError, setIaError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchKpis() {
      setKpisLoading(true)
      try {
        const res = await fetch(`/api/dashboard/stats?periodo=${periodo}`)
        if (!res.ok) throw new Error()
        const json = await res.json()
        setKpis(json.data ?? json)
      } catch {
        setKpis(null)
      } finally {
        setKpisLoading(false)
      }
    }
    fetchKpis()
  }, [periodo])

  useEffect(() => {
    async function fetchRelatorios() {
      setChartsLoading(true)
      try {
        const res = await fetch(`/api/relatorios?periodo=${periodo}`)
        if (!res.ok) throw new Error()
        const json: RelatorioData = await res.json()
        setBarData(json.evolucao ?? [])
        setPieData(json.categorias ?? [])
      } catch {
        setBarData([])
        setPieData([])
      } finally {
        setChartsLoading(false)
      }
    }
    fetchRelatorios()
  }, [periodo])

  function exportarCSV() {
    if (!barData.length) return
    const header = 'Periodo,Pacientes,Procedimentos\n'
    const rows = barData.map((r) => `${r.name},${r.pacientes},${r.procedimentos}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-hof-${periodo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function periodoToDateRange(p: Periodo): { inicio: string; fim: string } {
    const fim = new Date()
    const inicio = new Date()
    if (p === '7d') inicio.setDate(fim.getDate() - 7)
    else if (p === '30d') inicio.setDate(fim.getDate() - 30)
    else if (p === '6m') inicio.setMonth(fim.getMonth() - 6)
    else inicio.setFullYear(fim.getFullYear() - 1)
    return { inicio: inicio.toISOString(), fim: fim.toISOString() }
  }

  async function gerarAnaliseIA() {
    setIaLoading(true)
    setIaError(null)
    setIaAnalise(null)
    try {
      const { inicio, fim } = periodoToDateRange(periodo)
      const res = await fetch('/api/ia/relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'resumo_clinico', periodo: { inicio, fim } }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Serviço indisponível')
      }
      const json = await res.json()
      setIaAnalise(json.data?.analise ?? 'Análise gerada com sucesso.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'IA indisponível no momento'
      setIaError(`Não foi possível gerar a análise: ${msg}. Tente novamente mais tarde.`)
    } finally {
      setIaLoading(false)
    }
  }

  const kpiItems = [
    {
      label: 'Novos Pacientes',
      value: kpis?.novosPacientes,
      icon: Users,
      trend: kpis?.tendenciaPacientes ?? '—',
    },
    {
      label: 'Procedimentos Realizados',
      value: kpis?.procedimentosRealizados,
      icon: Syringe,
      trend: kpis?.tendenciaProcedimentos ?? '—',
    },
    {
      label: 'Prontuários Assinados',
      value: kpis?.prontuariosAssinados,
      icon: FileText,
      trend: kpis?.tendenciaProntuarios ?? '—',
    },
  ]

  return (
    <div>
      <style>{`
        @keyframes skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Relatórios Analíticos</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Visão gerencial de performance clínica
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Filtro de período */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-outline"
              onClick={() => setPeriodoOpen((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Filter size={16} />
              {PERIODO_LABELS[periodo]}
              <ChevronDown size={14} />
            </button>
            {periodoOpen && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 100,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card-hover)',
                minWidth: 180, padding: '0.5rem',
              }}>
                {(Object.keys(PERIODO_LABELS) as Periodo[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPeriodo(p); setPeriodoOpen(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)',
                      border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                      background: p === periodo ? 'rgba(46,93,142,0.08)' : 'transparent',
                      color: p === periodo ? 'var(--brand-primary)' : 'var(--text-primary)',
                      fontWeight: p === periodo ? 600 : 400,
                    }}
                  >
                    {PERIODO_LABELS[p]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-outline" onClick={exportarCSV} disabled={chartsLoading || !barData.length}>
            <Download size={16} /> Exportar CSV
          </button>

          <button className="btn btn-primary" onClick={() => setIaModalOpen(true)}>
            <Brain size={16} /> Análise IA
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {kpiItems.map((kpi) => (
          <div key={kpi.label} className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
                {kpi.label}
              </div>
              {kpisLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <SkeletonRect width={80} height={32} />
                  <SkeletonRect width={60} height={14} />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {kpi.value ?? '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--brand-success)' }}>
                    <TrendingUp size={12} /> {kpi.trend}
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)' }}>
              <kpi.icon size={20} color="var(--brand-accent)" />
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

        {/* Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Evolução de Atendimentos</h3>
          {chartsLoading ? (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spinner size={32} />
            </div>
          ) : barData.length === 0 ? (
            <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <BarChart3 size={48} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Sem dados para o período selecionado.</p>
            </div>
          ) : (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <RechartsTooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="procedimentos" name="Procedimentos" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pacientes" name="Pacientes" fill="var(--brand-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Procedimentos por Categoria</h3>
          {chartsLoading ? (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spinner size={32} />
            </div>
          ) : pieData.length === 0 ? (
            <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Syringe size={48} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Sem dados para o período selecionado.</p>
            </div>
          ) : (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                {pieData.map((entry, index) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Análise IA */}
      {iaModalOpen && (
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
            width: '100%', maxWidth: 600,
            animation: 'fade-in 0.2s ease',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.5rem', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain size={18} color="white" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Análise Inteligente</h2>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Período: {PERIODO_LABELS[periodo]}
                  </p>
                </div>
              </div>
              <button onClick={() => { setIaModalOpen(false); setIaAnalise(null); setIaError(null) }} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {!iaAnalise && !iaError && !iaLoading && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <Brain size={48} style={{ opacity: 0.15, margin: '0 auto 1rem auto', display: 'block' }} />
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 500 }}>
                    Gere uma análise dos seus dados clínicos
                  </p>
                  <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    A IA irá analisar tendências, identificar insights e sugerir ações para o período de {PERIODO_LABELS[periodo].toLowerCase()}.
                  </p>
                  <button className="btn btn-primary btn-lg" onClick={gerarAnaliseIA}>
                    <Brain size={16} /> Gerar Análise Inteligente
                  </button>
                </div>
              )}

              {iaLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem', gap: '1rem' }}>
                  <Spinner size={36} />
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Analisando dados clínicos...
                  </p>
                </div>
              )}

              {iaError && !iaLoading && (
                <div style={{ padding: '1.5rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '1rem', borderRadius: 'var(--radius)',
                    background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)',
                    color: 'var(--brand-danger)', marginBottom: '1.25rem', fontSize: '0.875rem',
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    {iaError}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.375rem 0.75rem', borderRadius: 'var(--radius)',
                      background: 'rgba(192,57,43,0.08)', color: 'var(--brand-danger)',
                      fontSize: '0.75rem', fontWeight: 600,
                    }}>
                      IA Indisponivel
                    </span>
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Utilize a exportacao CSV para analise manual dos dados.
                    </p>
                    <button className="btn btn-outline" style={{ marginTop: '0.5rem' }} onClick={gerarAnaliseIA}>
                      Tentar novamente
                    </button>
                  </div>
                </div>
              )}

              {iaAnalise && !iaLoading && (
                <div>
                  <div style={{
                    padding: '1.25rem', borderRadius: 'var(--radius)',
                    background: 'rgba(46,93,142,0.04)', border: '1px solid rgba(46,93,142,0.15)',
                    fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto',
                  }}>
                    {iaAnalise}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => { navigator.clipboard.writeText(iaAnalise) }}
                    >
                      Copiar Analise
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setIaAnalise(null); gerarAnaliseIA() }}>
                      Regenerar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
