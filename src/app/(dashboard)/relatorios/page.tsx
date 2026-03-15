'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, Filter, TrendingUp, Users, Syringe, FileText } from 'lucide-react'

const barData = [
  { name: 'Out', pacientes: 45, procedimentos: 52 },
  { name: 'Nov', pacientes: 52, procedimentos: 61 },
  { name: 'Dez', pacientes: 38, procedimentos: 45 },
  { name: 'Jan', pacientes: 65, procedimentos: 78 },
  { name: 'Fev', pacientes: 59, procedimentos: 70 },
  { name: 'Mar', pacientes: 80, procedimentos: 95 },
]

const pieData = [
  { name: 'Toxina', value: 45 },
  { name: 'Preenchimento', value: 30 },
  { name: 'Fios PDO', value: 15 },
  { name: 'Bioestimulador', value: 10 },
]

const COLORS = ['var(--brand-primary)', 'var(--brand-accent)', '#D4A574', '#4A90B8']

export default function RelatoriosPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Relatórios Analíticos</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Visão gerencial de performance clínica
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline">
            <Filter size={16} /> Últimos 6 meses
          </button>
          <button className="btn btn-primary">
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Novos Pacientes', value: '124', icon: Users, diff: '+12%' },
          { label: 'Procedimentos Realizados', value: '382', icon: Syringe, diff: '+8%' },
          { label: 'Prontuários Assinados', value: '350', icon: FileText, diff: '+15%' },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{kpi.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--brand-success)' }}>
                <TrendingUp size={12} /> {kpi.diff}
              </div>
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
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <RechartsTooltip 
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="procedimentos" name="Procedimentos" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pacientes" name="Pacientes" fill="var(--brand-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Procedimentos por Categoria</h3>
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
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
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
        </div>
      </div>
    </div>
  )
}
