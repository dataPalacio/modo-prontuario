'use client'

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

// Dados mock para demonstração
const stats = [
  {
    label: 'Pacientes Ativos',
    value: '247',
    trend: '+12 este mês',
    trendUp: true,
    icon: Users,
    color: 'primary',
  },
  {
    label: 'Prontuários',
    value: '1.842',
    trend: '+34 esta semana',
    trendUp: true,
    icon: FileText,
    color: 'accent',
  },
  {
    label: 'Consultas Hoje',
    value: '8',
    trend: '3 pendentes',
    trendUp: true,
    icon: Calendar,
    color: 'success',
  },
  {
    label: 'Procedimentos/Mês',
    value: '156',
    trend: '+8% vs mês anterior',
    trendUp: true,
    icon: Syringe,
    color: 'warning',
  },
]

const recentProntuarios = [
  {
    id: '1',
    numero: 'P-2024-0147',
    paciente: 'Maria Silva Santos',
    procedimento: 'Toxina Botulínica — Frontal',
    data: '14/03/2025',
    status: 'ASSINADO',
  },
  {
    id: '2',
    numero: 'P-2024-0146',
    paciente: 'João Carlos Oliveira',
    procedimento: 'Preenchimento AH — Lábios',
    data: '14/03/2025',
    status: 'EM_ANDAMENTO',
  },
  {
    id: '3',
    numero: 'P-2024-0145',
    paciente: 'Ana Beatriz Lima',
    procedimento: 'Bioestimulador — Radiesse',
    data: '13/03/2025',
    status: 'ABERTO',
  },
  {
    id: '4',
    numero: 'P-2024-0144',
    paciente: 'Roberto Mendes',
    procedimento: 'Fios de PDO — Lifting',
    data: '13/03/2025',
    status: 'ASSINADO',
  },
  {
    id: '5',
    numero: 'P-2024-0143',
    paciente: 'Carla Fernanda Costa',
    procedimento: 'Skinbooster — Facial',
    data: '12/03/2025',
    status: 'ARQUIVADO',
  },
]

const nextConsultas = [
  { horario: '09:00', paciente: 'Fernanda Alves', tipo: 'Retorno — Toxina' },
  { horario: '10:30', paciente: 'Carlos Eduardo', tipo: 'Avaliação Inicial' },
  { horario: '14:00', paciente: 'Juliana Martins', tipo: 'Preenchimento Labial' },
  { horario: '15:30', paciente: 'Marcos Ribeiro', tipo: 'Bioestimulador' },
  { horario: '17:00', paciente: 'Patrícia Souza', tipo: 'Retorno — Peeling' },
]

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

export default function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Visão geral da sua clínica · Sexta, 14 de março de 2025
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
        {stats.map((stat) => {
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '1.5rem',
      }}>
        {/* Recent Prontuários */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Prontuários Recentes</h2>
            <Link href="/prontuarios" className="btn btn-ghost btn-sm" style={{ color: 'var(--brand-primary)' }}>
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Paciente</th>
                  <th>Procedimento</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProntuarios.map((p) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }}>
                    <td>
                      <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                        {p.numero}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.paciente}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.procedimento}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{p.data}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agenda Today */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Calendar size={18} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--brand-primary)' }} />
              Agenda de Hoje
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {nextConsultas.map((c, i) => (
              <div
                key={i}
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
                  {c.horario}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{c.paciente}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.tipo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
