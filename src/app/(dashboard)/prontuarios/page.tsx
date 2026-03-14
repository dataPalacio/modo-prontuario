'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const prontuariosMock = [
  { id: '1', numero: 'P-2024-0147', paciente: 'Maria Silva Santos', profissional: 'Dr. Carlos Mendes',
    procedimento: 'Toxina Botulínica — Frontal', data: '14/03/2025', status: 'ASSINADO' },
  { id: '2', numero: 'P-2024-0146', paciente: 'João Carlos Oliveira', profissional: 'Dra. Ana Lima',
    procedimento: 'Preenchimento AH — Lábios', data: '14/03/2025', status: 'EM_ANDAMENTO' },
  { id: '3', numero: 'P-2024-0145', paciente: 'Ana Beatriz Lima', profissional: 'Dr. Carlos Mendes',
    procedimento: 'Bioestimulador — Radiesse', data: '13/03/2025', status: 'ABERTO' },
  { id: '4', numero: 'P-2024-0144', paciente: 'Roberto Mendes', profissional: 'Dra. Ana Lima',
    procedimento: 'Fios de PDO — Lifting', data: '13/03/2025', status: 'ASSINADO' },
  { id: '5', numero: 'P-2024-0143', paciente: 'Carla Fernanda Costa', profissional: 'Dr. Carlos Mendes',
    procedimento: 'Skinbooster — Facial', data: '12/03/2025', status: 'ARQUIVADO' },
  { id: '6', numero: 'P-2024-0142', paciente: 'Fernanda Alves', profissional: 'Dr. Carlos Mendes',
    procedimento: 'Microagulhamento', data: '12/03/2025', status: 'ASSINADO' },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ABERTO: { label: 'Aberto', cls: 'badge badge--aberto' },
    EM_ANDAMENTO: { label: 'Em Andamento', cls: 'badge badge--andamento' },
    ASSINADO: { label: 'Assinado', cls: 'badge badge--assinado' },
    ARQUIVADO: { label: 'Arquivado', cls: 'badge badge--arquivado' },
  }
  const { label, cls } = map[status] || map.ABERTO
  return <span className={cls}>{label}</span>
}

export default function ProntuariosPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')

  const filtered = prontuariosMock.filter((p) => {
    const matchSearch = p.paciente.toLowerCase().includes(search.toLowerCase()) ||
      p.numero.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'TODOS' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Prontuários</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Todos os prontuários eletrônicos da clínica
          </p>
        </div>
        <Link href="/prontuarios/novo" className="btn btn-primary">
          <Plus size={16} /> Novo Prontuário
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <Search size={16} style={{
              position: 'absolute', left: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              placeholder="Buscar por nº ou paciente..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {['TODOS', 'ABERTO', 'EM_ANDAMENTO', 'ASSINADO', 'ARQUIVADO'].map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter(s)}
                style={{ fontSize: '0.75rem' }}
              >
                {s === 'TODOS' ? 'Todos' : s === 'EM_ANDAMENTO' ? 'Em Andamento' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nº Prontuário</th>
                <th>Paciente</th>
                <th>Profissional</th>
                <th>Procedimento</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-mono" style={{
                      fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600,
                    }}>
                      {p.numero}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.paciente}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{p.profissional}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{p.procedimento}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{p.data}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <Link href={`/prontuarios/${p.id}`}
                        className="btn btn-ghost btn-sm"
                        title="Visualizar"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Baixar PDF"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
