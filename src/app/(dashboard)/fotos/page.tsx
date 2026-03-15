'use client'

import { useState } from 'react'
import { Search, Filter, UploadCloud, Image as ImageIcon, SlidersHorizontal } from 'lucide-react'

// Mock Data para Fotos
const fotosMock = [
  { id: '1', paciente: 'Maria Silva Santos', tipo: 'ANTES', angulo: 'Frontal', data: '2025-03-10', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400' },
  { id: '2', paciente: 'Maria Silva Santos', tipo: 'DEPOIS', angulo: 'Frontal', data: '2025-03-24', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400' },
  { id: '3', paciente: 'João Carlos Oliveira', tipo: 'ANTES', angulo: 'Perfil Direito', data: '2025-03-08', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400' },
  { id: '4', paciente: 'Ana Beatriz Lima', tipo: 'DURANTE', angulo: 'Frontal', data: '2025-03-13', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
  { id: '5', paciente: 'Carla Fernanda Costa', tipo: 'ANTES', angulo: 'Oblíquo Esquerdo', data: '2025-03-05', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400' },
]

export default function FotosPage() {
  const [search, setSearch] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')

  const filtered = fotosMock.filter(f => {
    const matchSearch = f.paciente.toLowerCase().includes(search.toLowerCase())
    const matchTipo = filtroTipo === 'TODOS' || f.tipo === filtroTipo
    return matchSearch && matchTipo
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Fotos Clínicas</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Gerenciamento e comparação de evolução (Antes/Depois)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline">
            <SlidersHorizontal size={16} /> Comparador
          </button>
          <button className="btn btn-primary">
            <UploadCloud size={16} /> Upload Foto
          </button>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <Search size={16} style={{
              position: 'absolute', left: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              placeholder="Buscar por paciente..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {['TODOS', 'ANTES', 'DURANTE', 'DEPOIS'].map((t) => (
              <button
                key={t}
                className={`btn btn-sm ${filtroTipo === t ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFiltroTipo(t)}
                style={{ fontSize: '0.75rem' }}
              >
                {t === 'TODOS' ? 'Exibir Tudo' : t}
              </button>
            ))}
            <button className="btn btn-outline btn-sm" style={{ marginLeft: '0.5rem' }}>
              <Filter size={14} /> Mais filtros
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Fotos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {filtered.map(foto => (
          <div key={foto.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              position: 'relative', 
              aspectRatio: '3/4', 
              background: 'var(--bg-elevated)',
              backgroundImage: `url(${foto.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {/* Badge Tipo */}
              <div style={{ 
                position: 'absolute', top: '0.75rem', right: '0.75rem',
                background: foto.tipo === 'ANTES' ? 'rgba(0,0,0,0.6)' : 
                            foto.tipo === 'DEPOIS' ? 'var(--brand-success)' : 'var(--brand-accent)',
                color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px',
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em'
              }}>
                {foto.tipo}
              </div>
            </div>
            
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {foto.paciente}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ImageIcon size={12} /> {foto.angulo}
                </span>
                <span>{new Date(foto.data).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
             <ImageIcon size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
             <p>Nenhuma foto clínica encontrada com os filtros atuais.</p>
          </div>
        )}
      </div>
    </div>
  )
}
