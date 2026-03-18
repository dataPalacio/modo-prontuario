'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  FileText,
  Calendar,
  Syringe,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Stat {
  label: string
  value: string | number
  trend: string
  trendUp: boolean
  icon: React.ElementType
  color: string
}

interface Prontuario {
  id: string
  numero: string
  paciente?: { nome: string }
  tipoProcedimento?: string
  createdAt?: string
  status: string
}

interface Agendamento {
  id: string
  dataHora: string
  paciente?: { nome: string }
  tipo: string
}

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; className: string }> = {
    ABERTO: { label: 'Aberto', className: 'badge badge--aberto' },
    EM_ANDAMENTO: { label: 'Em Andamento', className: 'badge badge--andamento' },
    ASSINADO: { label: 'Assinado', className: 'badge badge--assinado' },
    ARQUIVADO: { label: 'Arquivado', className: 'badge badge--arquivado' },
  }
  const { label, className } = statusMap[status] || statusMap.ABERTO
  return <span className={className}>{label}</span>
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

function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <SkeletonRect height={44} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <SkeletonRect width={60} height={28} />
        <SkeletonRect width={120} height={14} />
        <SkeletonRect width={80} height={12} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([])
  const [prontuariosLoading, setProntuariosLoading] = useState(true)
  const [agendaHoje, setAgendaHoje] = useState<Agendamento[]>([])
  const [agendaLoading, setAgendaLoading] = useState(true)

  const hoje = new Date()
  const dataHoje = format(hoje, 'yyyy-MM-dd')
  const dataHojeFormatada = format(hoje, "EEEE',' dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  useEffect(() => {
    async function fetchStats() {
      setStatsLoading(true)
      try {
        const res = await fetch('/api/dashboard/stats')
        if (!res.ok) throw new Error()
        const json = await res.json()
        const d = json.data ?? json

        setStats([
          {
            label: 'Pacientes Ativos',
            value: d.pacientesAtivos ?? d.totalPacientes ?? '—',
            trend: d.novosPacientesMes ? `+${d.novosPacientesMes} este mês` : '—',
            trendUp: true,
            icon: Users,
            color: 'primary',
          },
          {
            label: 'Prontuários',
            value: d.totalProntuarios ?? '—',
            trend: d.prontuariosSemana ? `+${d.prontuariosSemana} esta semana` : '—',
            trendUp: true,
            icon: FileText,
            color: 'accent',
          },
          {
            label: 'Consultas Hoje',
            value: d.consultasHoje ?? '—',
            trend: d.consultasPendentes ? `${d.consultasPendentes} pendentes` : '—',
            trendUp: true,
            icon: Calendar,
            color: 'success',
          },
          {
            label: 'Procedimentos/Mês',
            value: d.procedimentosMes ?? '—',
            trend: d.tendenciaProcedimentos ?? '—',
            trendUp: true,
            icon: Syringe,
            color: 'warning',
          },
        ])
      } catch {
        setStats([])
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    async function fetchProntuarios() {
      setProntuariosLoading(true)
      try {
        const res = await fetch('/api/prontuarios?page=1&pageSize=5')
        if (!res.ok) throw new Error()
        const json = await res.json()
        setProntuarios(json.data ?? [])
      } catch {
        setProntuarios([])
      } finally {
        setProntuariosLoading(false)
      }
    }
    fetchProntuarios()
  }, [])

  useEffect(() => {
    async function fetchAgendaHoje() {
      setAgendaLoading(true)
      try {
        const res = await fetch(`/api/agenda?dataInicio=${dataHoje}&dataFim=${dataHoje}`)
        if (!res.ok) throw new Error()
        const json = await res.json()
        setAgendaHoje(json.data ?? [])
      } catch {
        setAgendaHoje([])
      } finally {
        setAgendaLoading(false)
      }
    }
    fetchAgendaHoje()
  }, [dataHoje])

  return (
    <div>
      <style>{`
        @keyframes skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'capitalize' }}>
            Visão geral da sua clínica · {dataHojeFormatada}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/pacientes/novo" className="btn btn-outline btn-sm">
            <Plus size={16} />
            Novo Paciente
          </Link>
          <Link href="/prontuarios/novo" className="btn btn-primary btn-sm">
            <FileText size={16} />
            Novo Prontuário
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="stat-card">
                  <div className={`stat-card__icon stat-card__icon--${stat.color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="stat-card__value">{stat.value}</div>
                    <div className="stat-card__label">{stat.label}</div>
                    <div className={`stat-card__trend ${stat.trendUp ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
                      <TrendingUp size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {stat.trend}
                    </div>
                  </div>
                </div>
              )
            })}
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>

        {/* Recent Prontuários */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Prontuários Recentes</h2>
            <Link href="/prontuarios" className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-primary)' }}>
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {prontuariosLoading ? (
            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <SkeletonRect width={100} height={14} />
                  <SkeletonRect width={140} height={14} />
                  <SkeletonRect width={160} height={14} />
                  <SkeletonRect width={80} height={14} />
                  <SkeletonRect width={70} height={22} />
                </div>
              ))}
            </div>
          ) : prontuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ opacity: 0.2, margin: '0 auto 0.75rem auto', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Nenhum prontuário encontrado.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Paciente</th>
                    <th>Procedimento</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prontuarios.map((p) => (
                    <tr key={p.id} style={{ cursor: 'pointer' }}>
                      <td>
                        <Link href={`/prontuarios/${p.id}`} style={{ textDecoration: 'none' }}>
                          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                            {p.numero}
                          </span>
                        </Link>
                      </td>
                      <td style={{ fontWeight: 500 }}>{p.paciente?.nome ?? '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.tipoProcedimento ?? '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {p.createdAt ? format(new Date(p.createdAt), 'dd/MM/yyyy') : '—'}
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Agenda de Hoje */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Calendar size={18} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--brand-primary)' }} />
              Agenda de Hoje
            </h2>
          </div>

          {agendaLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.5rem 0' }}>
                  <SkeletonRect width={56} height={32} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <SkeletonRect width="80%" height={14} />
                    <SkeletonRect width="60%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : agendaHoje.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              <Calendar size={36} style={{ opacity: 0.2, margin: '0 auto 0.75rem auto', display: 'block' }} />
              <p style={{ fontSize: '0.875rem', margin: 0 }}>Sem consultas agendadas para hoje.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {agendaHoje
                .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
                .map((c, i) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      background: i === 0 ? 'rgba(74, 144, 184, 0.06)' : 'transparent',
                      border: i === 0 ? '1px solid rgba(74, 144, 184, 0.15)' : '1px solid transparent',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 48,
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius)',
                      background: i === 0 ? 'var(--brand-primary)' : 'var(--bg-primary)',
                      color: i === 0 ? 'white' : 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}>
                      <Clock size={12} style={{ marginRight: '0.25rem' }} />
                      {format(new Date(c.dataHora), 'HH:mm')}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{c.paciente?.nome ?? '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.tipo}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
