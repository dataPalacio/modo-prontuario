export default function ConfiguracoesPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Configurações</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configurações da clínica e profissional</p>
      <div className="card" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️</p>
          <p>Configurações em desenvolvimento</p>
          <p style={{ fontSize: '0.8125rem' }}>Dados da clínica, profissionais, plano e integrações</p>
        </div>
      </div>
    </div>
  )
}
