export default function RelatoriosPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Relatórios</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Estatísticas e análises da clínica</p>
      <div className="card" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</p>
          <p>Relatórios e gráficos em desenvolvimento</p>
          <p style={{ fontSize: '0.8125rem' }}>Procedimentos por tipo, faturamento, pacientes ativos</p>
        </div>
      </div>
    </div>
  )
}
