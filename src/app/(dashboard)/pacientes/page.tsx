'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatCPF, formatPhone, calcularIdade } from '@/lib/utils'

// Mock data
const pacientesMock = [
  {
    id: '1', nome: 'Maria Silva Santos', cpf: '12345678901', dataNasc: '1985-06-15',
    sexo: 'FEMININO', telefone: '11999887766', email: 'maria@email.com',
    ultimaConsulta: '2025-03-10', totalProntuarios: 12,
  },
  {
    id: '2', nome: 'João Carlos Oliveira', cpf: '98765432100', dataNasc: '1978-11-22',
    sexo: 'MASCULINO', telefone: '11988776655', email: 'joao@email.com',
    ultimaConsulta: '2025-03-08', totalProntuarios: 5,
  },
  {
    id: '3', nome: 'Ana Beatriz Lima', cpf: '45678912300', dataNasc: '1990-03-08',
    sexo: 'FEMININO', telefone: '11977665544', email: 'ana@email.com',
    ultimaConsulta: '2025-03-12', totalProntuarios: 8,
  },
  {
    id: '4', nome: 'Roberto Mendes Filho', cpf: '32165498700', dataNasc: '1972-09-30',
    sexo: 'MASCULINO', telefone: '11966554433', email: 'roberto@email.com',
    ultimaConsulta: '2025-02-28', totalProntuarios: 3,
  },
  {
    id: '5', nome: 'Carla Fernanda Costa', cpf: '65432198700', dataNasc: '1995-01-12',
    sexo: 'FEMININO', telefone: '11955443322', email: 'carla@email.com',
    ultimaConsulta: '2025-03-14', totalProntuarios: 2,
  },
]

export default function PacientesPage() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'table' | 'cards'>('table')

  const filtered = pacientesMock.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf.includes(search.replace(/\D/g, ''))
  )

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Pacientes</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {pacientesMock.length} pacientes cadastrados
          </p>
        </div>
        <Link href="/pacientes/novo" className="btn btn-primary">
          <Plus size={16} /> Novo Paciente
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{
              position: 'absolute', left: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-outline btn-sm">
            <Filter size={14} /> Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>CPF</th>
                <th>Idade</th>
                <th>Contato</th>
                <th>Última Consulta</th>
                <th>Prontuários</th>
                <th style={{ width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/pacientes/${p.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: p.sexo === 'FEMININO'
                          ? 'linear-gradient(135deg, #C9956A, #E8B87A)'
                          : 'linear-gradient(135deg, #4A90B8, #6BB3D9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {p.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{p.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.sexo === 'FEMININO' ? '♀' : '♂'} · {p.email}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: '0.8rem' }}>
                      {formatCPF(p.cpf)}
                    </span>
                  </td>
                  <td>{calcularIdade(p.dataNasc)} anos</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}>
                        <Phone size={12} color="var(--text-muted)" />
                        {formatPhone(p.telefone)}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {new Date(p.ultimaConsulta).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <span className="badge badge--aberto">{p.totalProntuarios}</span>
                  </td>
                  <td>
                    <button style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '0.25rem',
                    }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--border)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}>
          <span>Mostrando 1-5 de 247 pacientes</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn btn-ghost btn-sm" disabled><ChevronLeft size={14} /></button>
            <button className="btn btn-primary btn-sm" style={{ minWidth: 32 }}>1</button>
            <button className="btn btn-ghost btn-sm" style={{ minWidth: 32 }}>2</button>
            <button className="btn btn-ghost btn-sm" style={{ minWidth: 32 }}>3</button>
            <button className="btn btn-ghost btn-sm"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
