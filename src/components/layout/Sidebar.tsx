'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Syringe,
  Camera,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react'
import { useProntuarioStore } from '@/store/prontuarioStore'

const menuItems = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/pacientes', label: 'Pacientes', icon: Users },
      { href: '/prontuarios', label: 'Prontuários', icon: FileText },
    ],
  },
  {
    section: 'Clínica',
    items: [
      { href: '/procedimentos', label: 'Procedimentos', icon: Syringe },
      { href: '/agenda', label: 'Agenda', icon: Calendar },
      { href: '/fotos', label: 'Fotos Clínicas', icon: Camera },
    ],
  },
  {
    section: 'Análise',
    items: [
      { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useProntuarioStore()

  return (
    <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}
      style={{ width: sidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)' }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--brand-accent) 0%, #D4A574 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          flexShrink: 0,
        }}>
          🦷
        </div>
        {sidebarOpen && (
          <div>
            <h1 style={{ margin: 0, lineHeight: 1.2 }}>Prontuário HOF</h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              HARMONIZAÇÃO OROFACIAL
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((section) => (
          <div key={section.section}>
            {sidebarOpen && (
              <div className="sidebar-section">{section.section}</div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  title={item.label}
                  style={{ position: 'relative' }}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: sidebarOpen ? '1rem 1.5rem' : '1rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {sidebarOpen && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            borderRadius: 'var(--radius)',
            background: 'rgba(45, 125, 70, 0.1)',
            fontSize: '0.7rem',
            color: 'var(--brand-success)',
          }}>
            <Shield size={14} />
            <span>LGPD Compliance ativo</span>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem',
            width: '100%',
          }}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          {sidebarOpen && 'Recolher menu'}
        </button>
      </div>
    </aside>
  )
}
