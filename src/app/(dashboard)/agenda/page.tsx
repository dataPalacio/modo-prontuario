export default function AgendaPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Agenda</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Agenda de consultas e procedimentos</p>
      <div className="card" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</p>
          <p>Calendário de agendamentos em desenvolvimento</p>
          <p style={{ fontSize: '0.8125rem' }}>Integração com prontuário e procedimentos</p>
        </div>
      </div>
    </div>
  )
}
