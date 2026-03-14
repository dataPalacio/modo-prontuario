'use client'

import { Search, Bell, User, Menu } from 'lucide-react'
import { useProntuarioStore } from '@/store/prontuarioStore'

export default function Header() {
  const { searchQuery, setSearchQuery, setSidebarOpen, sidebarOpen } = useProntuarioStore()

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {/* Mobile menu toggle */}
        <button
          className="btn-ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: 'none',
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div style={{
          position: 'relative',
          maxWidth: 420,
          flex: 1,
        }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar paciente, prontuário ou procedimento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '2.5rem',
              background: 'var(--bg-primary)',
              border: '1px solid transparent',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            transition: 'all var(--transition-fast)',
          }}
          title="Notificações"
        >
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            background: 'var(--brand-danger)',
            borderRadius: '50%',
            border: '2px solid var(--bg-card)',
          }} />
        </button>

        {/* User Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.375rem 0.75rem',
          borderRadius: 'var(--radius)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <User size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Dr. Profissional
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              CRO 12345 · SP
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
