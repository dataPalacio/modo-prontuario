'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, FileSignature, Save, Printer, CheckCircle2 } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'

// Supondo que [id] venha via params, vamos usar mock
export default function ProntuarioDetalhePage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<'dados' | 'tcle'>('tcle')
  const [assinaturaData, setAssinaturaData] = useState<string | null>(null)
  const sigPad = useRef<any>(null)

  const handleClear = () => {
    sigPad.current?.clear()
    setAssinaturaData(null)
  }

  const handleSaveSignature = () => {
    if (sigPad.current?.isEmpty()) {
      alert('A assinatura não pode estar vazia.')
      return
    }
    setAssinaturaData(sigPad.current?.getTrimmedCanvas().toDataURL('image/png'))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/prontuarios" className="btn btn-ghost" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Prontuário P-2024-0147</h1>
            <span className="badge badge--aberto">Em Aberto</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Criado em 14/03/2025 para Maria Silva Santos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${tab === 'dados' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setTab('dados')}
          style={{ borderRadius: 'var(--radius) var(--radius) 0 0', borderBottom: tab === 'dados' ? 'none' : '1px solid transparent' }}
        >
          <User size={16} /> Dados Clínicos
        </button>
        <button 
          className={`btn ${tab === 'tcle' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setTab('tcle')}
          style={{ borderRadius: 'var(--radius) var(--radius) 0 0', borderBottom: tab === 'tcle' ? 'none' : '1px solid transparent' }}
        >
          <FileSignature size={16} /> TCLE e Assinaturas
        </button>
      </div>

      {/* Conteúdo */}
      <div className="card" style={{ padding: '2rem' }}>
        {tab === 'dados' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Ficha Clínica</h2>
            <p style={{ color: 'var(--text-muted)' }}>Módulo de Anamnese em desenvolvimento.</p>
          </div>
        )}

        {tab === 'tcle' && (
          <div style={{ animation: 'fade-in 0.3s ease' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
               <div>
                 <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Termo de Consentimento (TCLE)</h2>
                 <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Consentimento para procedimento de Toxina Botulínica</p>
               </div>
               <button className="btn btn-outline btn-sm">
                 <Printer size={16} /> Imprimir Termo
               </button>
             </div>

             <div style={{ 
               padding: '1.5rem', 
               background: 'rgba(255,255,255,0.02)', 
               borderRadius: 'var(--radius)', 
               border: '1px solid var(--border)',
               fontSize: '0.875rem',
               lineHeight: 1.6,
               color: 'var(--text-secondary)',
               marginBottom: '2rem',
               maxHeight: '300px',
               overflowY: 'auto'
             }}>
               <p style={{ marginBottom: '1rem' }}>
                 Eu, <strong>Maria Silva Santos</strong>, portador(a) do CPF 123.456.789-00, declaro ter sido
                 debidamente informado(a) pelo(a) cirurgião-dentista Dr(a). Carlos Mendes sobre os propósitos, riscos e alternativas do tratamento com Toxina Botulínica.
               </p>
               <p>
                 Estou ciente que o resultado não é definitivo, com duração média de 3 a 6 meses.
                 Autorizo também o registro fotográfico com fins exclusivos de acompanhamento clínico, conforme diretrizes da LGPD (Lei 13.709/2018).
               </p>
             </div>

             {/* Zona de Assinatura */}
             <div>
               <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Assinatura Digital do Paciente</h3>
               
               {assinaturaData ? (
                 <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-success)', marginBottom: '1rem', fontWeight: 600 }}>
                     <CheckCircle2 size={18} /> Assinatura Coletada
                   </div>
                   <img src={assinaturaData} alt="Assinatura do Paciente" style={{ maxHeight: 120, borderBottom: '1px solid var(--text-muted)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }} />
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assinado digitalmente por Maria Silva Santos em {new Date().toLocaleDateString()}</p>
                   <button onClick={() => setAssinaturaData(null)} className="btn btn-ghost btn-sm" style={{ marginTop: '1rem', color: 'var(--brand-warning)' }}>
                     Refazer Assinatura
                   </button>
                 </div>
               ) : (
                 <div>
                   <div style={{ border: '1px solid var(--text-primary)', borderRadius: 'var(--radius)', background: 'white', marginBottom: '1rem', overflow: 'hidden' }}>
                     <SignatureCanvas 
                        penColor="black"
                        canvasProps={{ width: 600, height: 200, className: 'sigCanvas', style: { width: '100%' } }}
                        ref={sigPad}
                     />
                   </div>
                   <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                     <button className="btn btn-outline" onClick={handleClear}>Limpar</button>
                     <button className="btn btn-primary" onClick={handleSaveSignature}>
                       <Save size={16} /> Confirmar Assinatura
                     </button>
                   </div>
                 </div>
               )}
             </div>

          </div>
        )}
      </div>
    </div>
  )
}
