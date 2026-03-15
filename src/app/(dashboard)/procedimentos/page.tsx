'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, Box, AlertTriangle, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

// Mock Data para Procedimentos
const procedimentosMock = [
  { id: '1', prontuarioId: 'p1', tipo: 'TOXINA_BOTULINICA', regiao: 'Frontal e Glabela', produto: 'Botox 100U', lote: 'B123X', paciente: 'Maria Silva Santos', data: '2025-03-14', alert: false },
  { id: '2', prontuarioId: 'p2', tipo: 'PREENCHIMENTO_ACIDO_HIALURONICO', regiao: 'Lábios', produto: 'Restylane Kysse', lote: 'R456Y', paciente: 'João Carlos Oliveira', data: '2025-03-14', alert: false },
  { id: '3', prontuarioId: 'p3', tipo: 'BIOESTIMULADOR_COLAGENO', regiao: 'Face Total', produto: 'Radiesse', lote: 'RD789Z', paciente: 'Ana Beatriz Lima', data: '2025-03-13', alert: true },
  { id: '4', prontuarioId: 'p4', tipo: 'FIOS_PDO', regiao: 'Malar', produto: 'Mint', lote: 'M101A', paciente: 'Roberto Mendes Filho', data: '2025-03-10', alert: false },
  { id: '5', prontuarioId: 'p5', tipo: 'SKINBOOSTER', regiao: 'Olheiras', produto: 'Restylane Vital', lote: 'RV202B', paciente: 'Carla Fernanda Costa', data: '2025-03-08', alert: false },
]

function formatTipo(tipo: string) {
  return tipo.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
}

export default function ProcedimentosPage() {
  const [search, setSearch] = useState('')

  const filtered = procedimentosMock.filter((p) =>
    p.produto.toLowerCase().includes(search.toLowerCase()) || 
    p.lote.toLowerCase().includes(search.toLowerCase()) ||
    p.paciente.toLowerCase().includes(search.toLowerCase())
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Rastreabilidade de Procedimentos</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {procedimentosMock.length} registros (ANVISA Compliance)
          </p>
        </div>
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
              placeholder="Buscar por lote, produto ou paciente..."
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
                <th>Lote</th>
                <th>Produto</th>
                <th>Procedimento / Região</th>
                <th>Paciente</th>
                <th>Data</th>
                <th>Prontuário</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Box size={14} color="var(--text-muted)" />
                      <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.lote}</span>
                      {p.alert && (
                        <AlertTriangle size={14} color="var(--brand-warning)" title="Validade próxima" />
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.produto}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{formatTipo(p.tipo)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.regiao}</span>
                    </div>
                  </td>
                  <td>{p.paciente}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {new Date(p.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <Link href={`/prontuarios/${p.prontuarioId}`} className="btn btn-ghost btn-sm" title="Ver Prontuário">
                      <Eye size={16} /> Ver
                    </Link>
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
          <span>Mostrando 1-5 de {procedimentosMock.length} registros</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
             <button className="btn btn-ghost btn-sm" disabled><ChevronLeft size={14} /></button>
             <button className="btn btn-primary btn-sm" style={{ minWidth: 32 }}>1</button>
             <button className="btn btn-ghost btn-sm"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
