'use client'

import { useState } from 'react'
import { User, Building2, PenLine, Shield, Save } from 'lucide-react'

type Tab = 'perfil' | 'clinica' | 'assinatura' | 'seguranca'

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Configurações</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Gerencie suas preferências de uso e dados do sistema
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 3fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Menu Lateral Abas */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'perfil', label: 'Meu Perfil', icon: User },
            { id: 'clinica', label: 'Dados da Clínica', icon: Building2 },
            { id: 'assinatura', label: 'Assinatura Digital', icon: PenLine },
            { id: 'seguranca', label: 'Segurança e LGPD', icon: Shield },
          ].map((tab) => {
             const Icon = tab.icon
             const isActive = activeTab === tab.id
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as Tab)}
                 style={{
                   display: 'flex', alignItems: 'center', gap: '0.75rem',
                   padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
                   background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                   border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                   color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                   cursor: 'pointer', textAlign: 'left',
                   fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
                   transition: 'all 0.2s ease',
                 }}
               >
                 <Icon size={18} />
                 {tab.label}
               </button>
             )
          })}
        </nav>

        {/* Área de Conteúdo */}
        <div className="card" style={{ padding: '2rem' }}>
          
          {activeTab === 'perfil' && (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Informações Profissionais</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input type="text" className="form-input" defaultValue="Dr. Carlos Mendes" />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail Profissional</label>
                  <input type="email" className="form-input" defaultValue="carlos@clinicapremium.com.br" disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Registro Profissional (CRO/CRM)</label>
                  <input type="text" className="form-input" defaultValue="CRO-SP 12345" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone Celular</label>
                  <input type="text" className="form-input" defaultValue="(11) 98877-6655" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <button className="btn btn-primary">
                  <Save size={16} /> Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab === 'clinica' && (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Dados da Clínica</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Estes dados sairão no cabeçalho do PDF dos prontuários gerados.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome da Clínica (Razão Social ou Fantasia)</label>
                  <input type="text" className="form-input" defaultValue="Clínica HOF Premium" />
                </div>
                <div className="form-group">
                  <label className="form-label">Endereço Completo</label>
                  <input type="text" className="form-input" defaultValue="Av. Paulista, 1000 - Conj 105 - SP" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assinatura' && (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Minha Assinatura</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Esta assinatura será inserida em cada Prontuário firmado por você.
              </p>
              
              <div style={{ 
                border: '1px dashed var(--border)', 
                borderRadius: 'var(--radius)', 
                background: '#fff', 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '1.5rem 0'
              }}>
                <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '0.875rem' }}>
                  A funcionalidade do canvas de desenho será ativada na integração
                </span>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Gestão de Acessos</h2>
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                 <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-success)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                   <Shield size={16} /> LGPD Compliance ativo
                 </p>
                 <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                   O registro de IPs e interações sobre dados sensíveis aos pacientes é auditado internamente. 
                   Sua senha deve possuir mais de 8 caracteres.
                 </p>
                 <button className="btn btn-outline" style={{ marginTop: '1rem' }}>Mudar Minha Senha</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
